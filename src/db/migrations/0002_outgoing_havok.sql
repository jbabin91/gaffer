CREATE TABLE "invitation" (
	"code_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"invited_by" text NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"metadata" text,
	"revoked_at" timestamp with time zone,
	"use_count" integer DEFAULT 0 NOT NULL,
	"used_at" timestamp with time zone,
	"used_by" text,
	CONSTRAINT "invitation_codeHash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
CREATE TABLE "invite_pending" (
	"created_at" timestamp with time zone NOT NULL,
	"invitation_id" text NOT NULL,
	"key" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_used_by_user_id_fk" FOREIGN KEY ("used_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_pending" ADD CONSTRAINT "invite_pending_invitation_id_invitation_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invitation_expires_at_idx" ON "invitation" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "invitation_created_at_idx" ON "invitation" USING btree ("created_at");