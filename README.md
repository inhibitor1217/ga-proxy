# ga-proxy

## Running the server

### Configuration
To set up, write your [GA track id](https://support.google.com/analytics/thread/13109681?hl=en) on `config.json` or some other file.
```json
{
    "ga_track_id": "UA-XXXXXX-Y" // your google analytics track id
}
```

### Installation
```bash
$ npm install
```

### Local server
```bash
$ npm run dev
```

### Deploy on AWS
```bash
// uses config.json by default
$ npm run deploy

// specify config file
$ CONFIG_FILE=config.json npm run deploy
```

## Google Measurement Protocol Parameters

### Required
- [STATIC] Protocol version: `v=1`
- [GLOBAL] Measurement id (track id): `tid=UA-XXXXXX-Y`
- [PER_SESSION] Client id: `cid=35009a79-1a05-49d7-b876-2b884d0f825b`
    - Should control this in proxy server, by identifying requests from same ip address
    - Should be uuidv4
- [QUERY] Hit type: `t=pageview` or `t=event`

### Optional
- [STATIC] Data source: `ds=web`
- [PER_SESSION] Session control: `sc=start` or `sc=end`
    - Could control this in proxy...
- [PER_REQUEST] IP Override: `uip=1.2.3.4`
    - GA use this to infer location
    - Could retrieve this from request IP
- [PER_REQUEST] User Agent Override: `ua=Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14`
    - Could retreive this from request user agent
- [QUERY] Document Host Name: `dh=example.com`
    - Set this to host (e.g. notion.so)
- [QUERY] Document Path: `dp=/path`
    - Set this to page path
- [QUERY] Document Title: `dt=title`
    - Set this to page title

## Events
Is there any events that can be invoked from notion? (e.g. toggle dropdown)
- Toggle dropdown invokes new HTTP request (since it loades hidden image under toggle), so it can be recorded
- Page links can also invoke new HTTP requests (embed image urls in the linked page)

- [QUERY] Event Category: `ec=Category`
- [QUERY] Event Action: `ea=Action`
- [QUERY] Event Label: `el=Label`
- [QUERY] Event Value: `ev=42`
