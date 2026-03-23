# TRANSCRIPT - test-sticky-4

## Source
- **Video:** "DNS Explained in 100 Seconds"
- **Channel:** Fireship
- **URL:** https://www.youtube.com/watch?v=UVR9lhUGAyU

## Template Type
STICKY (3-layer, dynamic)

## Original Text (IDENTICAN)
when you type a url into the browser it makes a dns query to figure out which unique ip address is associated with that hostname first it'll attempt to look in the local browser or operating system cache but if the cache is empty then we need to look up the ip address in the phone book which is the job of a server known as the dns recursive resolver it's recursive because it needs to make multiple requests to other servers starting with the root name server which itself will respond with the address of a top level domain dns server which stores data about top level domains like com or dot io the resolver makes a request there which will respond with the ip address of the authoritative name server that's the final source of truth that contains the requested website's ip address that gets sent back down to the client and is cached for future use

## Word Count
~130 words

## Expected Flow (Step-by-step)
1. Browser makes DNS query
2. Check local cache (browser/OS)
3. Contact DNS recursive resolver
4. Query root name server
5. Query TLD server (com, io)
6. Get IP from authoritative name server
