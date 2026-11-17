CREATE TYPE "role" AS ENUM ('ADMIN','HOD','STAFF');
--> statement-breakpoint
CREATE TYPE "account_status" AS ENUM ('PENDING','ACTIVE','SUSPENDED');
--> statement-breakpoint
CREATE TYPE "staff_type" AS ENUM ('ACADEMIC','NON_ACADEMIC');
--> statement-breakpoint
CREATE TYPE "employment_status" AS ENUM ('ACTIVE','ON_LEAVE','RETIRED');
--> statement-breakpoint
CREATE TYPE "leave_status" AS ENUM ('PENDING','APPROVED','REJECTED','CANCELLED');
--> statement-breakpoint
CREATE TYPE "verification_kind" AS ENUM ('EMAIL','RESET','INVITE');
--> statement-breakpoint
CREATE TYPE "document_status" AS ENUM ('PENDING','VERIFIED','REJECTED');
--> statement-breakpoint
CREATE TABLE "departments" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "name" varchar(160) NOT NULL,
 "code" varchar(24) NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "users" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "department_id" uuid NOT NULL REFERENCES "departments"("id"),
 "email" varchar(254) NOT NULL UNIQUE,
 "password_hash" text NOT NULL,
 "role" "role" DEFAULT 'STAFF' NOT NULL,
 "status" "account_status" DEFAULT 'PENDING' NOT NULL,
 "requested_staff_id" varchar(30),
 "email_verified_at" timestamptz,
 "force_password_change" boolean DEFAULT false NOT NULL,
 "failed_login_count" integer DEFAULT 0 NOT NULL,
 "locked_until" timestamptz,
 "created_at" timestamptz DEFAULT now() NOT NULL,
 "archived_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "users_department_idx" ON "users"("department_id");
--> statement-breakpoint
CREATE TABLE "staff_profiles" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "user_id" uuid UNIQUE REFERENCES "users"("id"),
 "department_id" uuid NOT NULL REFERENCES "departments"("id"),
 "staff_id" varchar(30) NOT NULL UNIQUE,
 "full_name" varchar(150) NOT NULL,
 "rank" varchar(100) NOT NULL,
 "staff_type" "staff_type" NOT NULL,
 "status" "employment_status" DEFAULT 'ACTIVE' NOT NULL,
 "appointed_on" date NOT NULL,
 "qualifications" text DEFAULT '' NOT NULL,
 "specialization" text DEFAULT '' NOT NULL,
 "unit" varchar(120) DEFAULT 'General' NOT NULL,
 "office_location" varchar(120) DEFAULT '' NOT NULL,
 "public_email" varchar(254) DEFAULT '' NOT NULL,
 "phone" varchar(24),
 "home_address_encrypted" text,
 "national_id_encrypted" text,
 "emergency_contact_encrypted" text,
 "date_of_birth" date,
 "photo_url" text,
 "archived_at" timestamptz,
 "created_at" timestamptz DEFAULT now() NOT NULL,
 "updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "staff_directory_idx" ON "staff_profiles"("department_id","status","staff_type");
--> statement-breakpoint
CREATE INDEX "staff_name_idx" ON "staff_profiles"("full_name");
--> statement-breakpoint
CREATE TABLE "sessions" (
 "id_hash" varchar(64) PRIMARY KEY NOT NULL,
 "user_id" uuid NOT NULL REFERENCES "users"("id"),
 "created_at" timestamptz DEFAULT now() NOT NULL,
 "last_seen_at" timestamptz DEFAULT now() NOT NULL,
 "absolute_expires_at" timestamptz NOT NULL,
 "revoked_at" timestamptz
);
--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "sessions"("user_id");
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "token_hash" varchar(64) NOT NULL UNIQUE,
 "kind" "verification_kind" NOT NULL,
 "user_id" uuid REFERENCES "users"("id"),
 "email" varchar(254),
 "invite_role" "role",
 "created_by" uuid REFERENCES "users"("id"),
 "expires_at" timestamptz NOT NULL,
 "used_at" timestamptz,
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
 "key_hash" varchar(64) PRIMARY KEY NOT NULL,
 "hits" integer DEFAULT 0 NOT NULL,
 "window_start" timestamptz NOT NULL,
 "blocked_until" timestamptz
);
--> statement-breakpoint
CREATE TABLE "courses" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "department_id" uuid NOT NULL REFERENCES "departments"("id"),
 "code" varchar(16) NOT NULL,
 "title" varchar(160) NOT NULL,
 "units" integer NOT NULL,
 "level" integer NOT NULL,
 "semester" integer NOT NULL,
 "archived_at" timestamptz,
 CONSTRAINT "course_units_positive" CHECK ("units" BETWEEN 1 AND 12),
 CONSTRAINT "course_semester_valid" CHECK ("semester" BETWEEN 1 AND 2)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "course_code_dept_idx" ON "courses"("department_id","code");
--> statement-breakpoint
CREATE TABLE "course_assignments" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "course_id" uuid NOT NULL REFERENCES "courses"("id"),
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "session" varchar(12) NOT NULL,
 "assigned_by" uuid NOT NULL REFERENCES "users"("id"),
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "course_assignment_unique" ON "course_assignments"("course_id","staff_id","session");
--> statement-breakpoint
CREATE TABLE "leave_requests" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "type" varchar(32) NOT NULL,
 "start_date" date NOT NULL,
 "end_date" date NOT NULL,
 "reason" text NOT NULL,
 "status" "leave_status" DEFAULT 'PENDING' NOT NULL,
 "decision_comment" text,
 "decided_by" uuid REFERENCES "users"("id"),
 "recorded_by" uuid REFERENCES "users"("id"),
 "created_at" timestamptz DEFAULT now() NOT NULL,
 "updated_at" timestamptz DEFAULT now() NOT NULL,
 CONSTRAINT "leave_date_range" CHECK ("end_date">="start_date")
);
--> statement-breakpoint
CREATE INDEX "leave_staff_idx" ON "leave_requests"("staff_id","start_date");
--> statement-breakpoint
CREATE TABLE "leave_history" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "request_id" uuid NOT NULL REFERENCES "leave_requests"("id"),
 "actor_id" uuid NOT NULL REFERENCES "users"("id"),
 "from_status" "leave_status",
 "to_status" "leave_status" NOT NULL,
 "comment" text,
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_balances" (
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "year" integer NOT NULL,
 "allowance_days" integer DEFAULT 28 NOT NULL,
 PRIMARY KEY("staff_id","year"),
 CONSTRAINT "allowance_nonnegative" CHECK ("allowance_days">=0)
);
--> statement-breakpoint
CREATE TABLE "attendance" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "date" date NOT NULL,
 "status" varchar(18) NOT NULL,
 "duty" text DEFAULT '' NOT NULL,
 "recorded_by" uuid NOT NULL REFERENCES "users"("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_unique" ON "attendance"("staff_id","date");
--> statement-breakpoint
CREATE TABLE "staff_documents" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "title" varchar(120) NOT NULL,
 "kind" varchar(24) NOT NULL,
 "url" text NOT NULL,
 "status" "document_status" DEFAULT 'PENDING' NOT NULL,
 "verified_by" uuid REFERENCES "users"("id"),
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "category" varchar(20) NOT NULL,
 "title" varchar(200) NOT NULL,
 "year" integer NOT NULL,
 "url" text,
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appraisals" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "staff_id" uuid NOT NULL REFERENCES "staff_profiles"("id"),
 "period" varchar(30) NOT NULL,
 "rating" integer NOT NULL,
 "notes" text NOT NULL,
 "recorded_by" uuid NOT NULL REFERENCES "users"("id"),
 "created_at" timestamptz DEFAULT now() NOT NULL,
 CONSTRAINT "appraisal_rating_range" CHECK ("rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "announcements" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "department_id" uuid NOT NULL REFERENCES "departments"("id"),
 "title" varchar(150) NOT NULL,
 "body" text NOT NULL,
 "author_id" uuid NOT NULL REFERENCES "users"("id"),
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
 "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
 "actor_id" uuid,
 "department_id" uuid REFERENCES "departments"("id"),
 "event" varchar(70) NOT NULL,
 "entity" varchar(60),
 "entity_id" varchar(80),
 "ip_hash" varchar(64),
 "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
 "created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs"("created_at");
--> statement-breakpoint
-- Database-enforced append-only audit log: even privileged application code cannot UPDATE or DELETE rows.
CREATE FUNCTION prevent_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'audit_logs are append-only'; END $$;
--> statement-breakpoint
CREATE TRIGGER audit_logs_immutable BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE FUNCTION prevent_audit_mutation();
