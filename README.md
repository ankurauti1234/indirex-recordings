worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    proxy_buffering off;
    chunked_transfer_encoding on;

    ##
    ## 1) HTTP (Port 80) — ACME + Redirect to HTTPS
    ##
    server {
        listen 80;
        server_name am.recorder.indirex.io;

        # Let’s Encrypt verification
        location /.well-known/acme-challenge/ {
            root C:/certs/.well-known/;
        }

        # Everything else → redirect to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    ##
    ## 2) HTTPS Video + API Server (Port 443)
    ##
    server {
        listen 443 ssl;
        server_name am.recorder.indirex.io;

        ssl_certificate     C:/certs/YOUR_FULLCHAIN_PATH.pem;
        ssl_certificate_key C:/certs/YOUR_PRIVKEY_PATH.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;

        client_max_body_size 500M;
        client_body_buffer_size 128k;

        # CORS (required for browser video playback)
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods 'GET, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Origin, Content-Type, Accept, Authorization' always;

        ##
        ## Video files
        ##
        location /1_HR_media/ {
            alias D:/1_HR_media/LowRess/;

            autoindex off;

            # Video playback + seeking
            add_header Accept-Ranges bytes;
            add_header Cache-Control "public, max-age=3600";
            expires 1h;

            types {
                video/mp4 mp4;
            }
        }

        ##
        ## API → Node.js backend
        ##
        location /api/ {
            proxy_pass http://localhost:3001/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
