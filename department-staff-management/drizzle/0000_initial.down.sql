-- DOWN MIGRATION (DESTRUCTIVE; NEVER on production). Back up first.
DROP TRIGGER IF EXISTS audit_logs_immutable ON audit_logs;
DROP FUNCTION IF EXISTS prevent_audit_mutation();
DROP TABLE IF EXISTS audit_logs,announcements,appraisals,publications,staff_documents,attendance,leave_balances,leave_history,leave_requests,course_assignments,courses,rate_limits,auth_tokens,sessions,staff_profiles,users,departments CASCADE;
DROP TYPE IF EXISTS document_status,verification_kind,leave_status,employment_status,staff_type,account_status,role;
