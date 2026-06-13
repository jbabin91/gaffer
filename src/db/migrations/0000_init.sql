CREATE TABLE "careers" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"manager_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_catalog" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"age" integer,
	"nationality" text,
	"club_name" text,
	"primary_position" text,
	"positions" text,
	"overall" integer,
	"potential" integer,
	"value_eur" integer,
	"wage_eur" integer,
	"pace" integer,
	"shooting" integer,
	"passing" integer,
	"dribbling" integer,
	"defending" integer,
	"physical" integer
);
--> statement-breakpoint
CREATE TABLE "player_snapshots" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" text NOT NULL,
	"season_id" text,
	"in_game_week" integer NOT NULL,
	"overall" integer NOT NULL,
	"potential" integer,
	"market_value_eur" integer,
	"form" real,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"career_id" text NOT NULL,
	"catalog_id" integer,
	"name" text NOT NULL,
	"age" integer,
	"nationality" text,
	"primary_position" text,
	"secondary_positions" text,
	"squad_number" integer,
	"on_squad" boolean DEFAULT true NOT NULL,
	"overall" integer,
	"potential" integer,
	"market_value_eur" integer,
	"wage_eur" integer,
	"contract_until" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"career_id" text NOT NULL,
	"label" text NOT NULL,
	"start_year" integer,
	"club_name" text,
	"league" text,
	"final_position" integer,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_snapshots" ADD CONSTRAINT "player_snapshots_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_snapshots" ADD CONSTRAINT "player_snapshots_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_catalog_id_player_catalog_id_fk" FOREIGN KEY ("catalog_id") REFERENCES "public"."player_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "catalog_name_idx" ON "player_catalog" USING btree ("full_name");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshot_player_week_idx" ON "player_snapshots" USING btree ("player_id","in_game_week");--> statement-breakpoint
CREATE INDEX "players_career_idx" ON "players" USING btree ("career_id");--> statement-breakpoint
CREATE INDEX "seasons_career_idx" ON "seasons" USING btree ("career_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seasons_one_current_per_career_idx" ON "seasons" USING btree ("career_id") WHERE "seasons"."is_current";