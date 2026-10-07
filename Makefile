up:        ; docker compose up -d db
migrate:   ; DATABASE_URL=$${DATABASE_URL:-postgresql://gezi:gezi_dev_password@localhost:5432/gezi} ./scripts/migrate.sh
seed:      ; DATABASE_URL=$${DATABASE_URL:-postgresql://gezi:gezi_dev_password@localhost:5432/gezi} ./scripts/migrate.sh --seed
reset:     ; docker compose down -v && docker compose up -d db && sleep 5 && $(MAKE) seed
psql:      ; psql postgresql://gezi:gezi_dev_password@localhost:5432/gezi
