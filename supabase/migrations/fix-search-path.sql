
-- Fix the search_path issue in existing functions without dropping them

-- Update the set_blog_author_id function
CREATE OR REPLACE FUNCTION public.set_blog_author_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.author_id = auth.uid();
  RETURN NEW;
END;
$function$;

-- Update the record_pageview function
CREATE OR REPLACE FUNCTION public.record_pageview(site_id uuid, page_url text, referrer text, user_agent text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_id UUID;
BEGIN
  -- Extract browser, OS and device info from user agent (simplified)
  INSERT INTO public.pageviews (
    website_id, 
    page_url, 
    referrer, 
    user_agent,
    browser,
    os,
    device,
    ip,
    created_at
  )
  VALUES (
    site_id,
    page_url,
    referrer,
    user_agent,
    -- Simplified browser detection
    CASE 
      WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
      WHEN user_agent ILIKE '%chrome%' THEN 'Chrome'
      WHEN user_agent ILIKE '%safari%' THEN 'Safari'
      WHEN user_agent ILIKE '%edge%' THEN 'Edge'
      ELSE 'Other'
    END,
    -- Simplified OS detection
    CASE 
      WHEN user_agent ILIKE '%windows%' THEN 'Windows'
      WHEN user_agent ILIKE '%mac%' THEN 'Mac'
      WHEN user_agent ILIKE '%linux%' THEN 'Linux'
      WHEN user_agent ILIKE '%android%' THEN 'Android'
      WHEN user_agent ILIKE '%ios%' THEN 'iOS'
      ELSE 'Other'
    END,
    -- Simplified device detection
    CASE 
      WHEN user_agent ILIKE '%mobile%' THEN 'Mobile'
      WHEN user_agent ILIKE '%tablet%' THEN 'Tablet'
      ELSE 'Desktop'
    END,
    inet_client_addr()::text,
    now()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$function$;
