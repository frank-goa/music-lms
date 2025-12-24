-- MusicLMS Seed Data
-- This file contains realistic dummy data for testing the MusicLMS application
-- Run this after creating the schema to populate the database with sample data

-- Note: This data assumes you have already created auth.users entries for the teachers and students
-- The UUIDs below should match auth.users IDs, or you'll need to adjust them

-- ============================================
-- TEACHERS (Users and Teacher Profiles)
-- ============================================

-- Teacher 1: Sarah Johnson
INSERT INTO public.users (id, email, role, full_name, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'sarah.johnson@musicstudio.com', 'teacher', 'Sarah Johnson', NOW(), NOW());

INSERT INTO public.teacher_profiles (id, user_id, studio_name, bio, created_at, updated_at) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Harmony Music Studio', 'Professional piano instructor with 15 years of experience. Specializing in classical and contemporary styles.', NOW(), NOW());

-- Teacher 2: Michael Chen
INSERT INTO public.users (id, email, role, full_name, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333333', 'michael.chen@guitarschool.com', 'teacher', 'Michael Chen', NOW(), NOW());

INSERT INTO public.teacher_profiles (id, user_id, studio_name, bio, created_at, updated_at) VALUES
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'String Theory Guitar School', 'Guitar virtuoso and music theory expert. Teaching all levels from beginner to advanced.', NOW(), NOW());

-- ============================================
-- STUDENTS (Users and Student Profiles)
-- ============================================

-- Students of Sarah Johnson (Piano)
INSERT INTO public.users (id, email, role, full_name, created_at, updated_at) VALUES
('55555555-5555-5555-5555-555555555555', 'emma.williams@email.com', 'student', 'Emma Williams', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'james.brown@email.com', 'student', 'James Brown', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'sophia.davis@email.com', 'student', 'Sophia Davis', NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'olivia.martinez@email.com', 'student', 'Olivia Martinez', NOW(), NOW());

INSERT INTO public.student_profiles (id, user_id, teacher_id, instrument, skill_level, notes, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Piano', 'beginner', 'Started 3 months ago. Quick learner with good ear for melody.', NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Piano', 'intermediate', 'Playing for 2 years. Working on classical pieces. Struggles with sight reading.', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Piano', 'advanced', 'Competition level. Excellent technique. Working on Chopin nocturnes.', NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Piano', 'beginner', 'Adult learner. Busy schedule but practices consistently.', NOW(), NOW());

-- Students of Michael Chen (Guitar)
INSERT INTO public.users (id, email, role, full_name, created_at, updated_at) VALUES
('99999999-9999-9999-9999-999999999999', 'alexander.taylor@email.com', 'student', 'Alexander Taylor', NOW(), NOW()),
('aaaaaaaa-0000-0000-0000-000000000000', 'isabella.anderson@email.com', 'student', 'Isabella Anderson', NOW(), NOW()),
('bbbbbbbb-1111-1111-1111-111111111111', 'ethan.thomas@email.com', 'student', 'Ethan Thomas', NOW(), NOW());

INSERT INTO public.student_profiles (id, user_id, teacher_id, instrument, skill_level, notes, created_at, updated_at) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '99999999-9999-9999-9999-999999999999', '33333333-3333-3333-3333-333333333333', 'Guitar', 'intermediate', 'Rock and blues focus. Writing original songs.', NOW(), NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Guitar', 'beginner', 'Just started. Learning basic chords and strumming patterns.', NOW(), NOW()),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'bbbbbbbb-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Guitar', 'advanced', 'Jazz guitar specialist. Complex chord progressions and improvisation.', NOW(), NOW());

-- ============================================
-- INVITES (Teacher invitations to students)
-- ============================================

INSERT INTO public.invites (id, teacher_id, email, token, expires_at, used_at, created_at) VALUES
('inv001', '11111111-1111-1111-1111-111111111111', 'emma.williams@email.com', 'token-abc-123', NOW() + INTERVAL '7 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days'),
('inv002', '11111111-1111-1111-1111-111111111111', 'james.brown@email.com', 'token-def-456', NOW() + INTERVAL '7 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '12 days'),
('inv003', '33333333-3333-3333-3333-333333333333', 'alexander.taylor@email.com', 'token-ghi-789', NOW() + INTERVAL '7 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '8 days');

-- ============================================
-- ASSIGNMENTS (Created by teachers)
-- ============================================

-- Sarah Johnson's Piano Assignments
INSERT INTO public.assignments (id, teacher_id, title, description, due_date, created_at, updated_at) VALUES
('asgn001', '11111111-1111-1111-1111-111111111111', 'C Major Scale Practice', 'Practice C major scale with both hands. Focus on even tempo and proper finger technique. Metronome at 60 BPM.', NOW() + INTERVAL '7 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
('asgn002', '11111111-1111-1111-1111-111111111111', 'Minuet in G', 'Learn the first 16 bars of Minuet in G. Pay attention to dynamics and phrasing.', NOW() + INTERVAL '14 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('asgn003', '11111111-1111-1111-1111-111111111111', 'Chord Progressions', 'Practice I-V-vi-IV progression in C major. Use different rhythmic patterns.', NOW() + INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('asgn004', '11111111-1111-1111-1111-111111111111', 'Chopin Nocturne Op. 9 No. 2', 'Continue working on Nocturne. Focus on the rubato in measures 24-32 and the emotional expression.', NOW() + INTERVAL '21 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('asgn005', '11111111-1111-1111-1111-111111111111', 'Sight Reading Exercise', 'Practice sight reading 5 new pieces this week. Record yourself on one piece and submit.', NOW() + INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Michael Chen's Guitar Assignments
INSERT INTO public.assignments (id, teacher_id, title, description, due_date, created_at, updated_at) VALUES
('asgn006', '33333333-3333-3333-3333-333333333333', 'Blues Scale Improvisation', 'Practice A blues scale across the fretboard. Improvise over a 12-bar blues backing track.', NOW() + INTERVAL '7 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('asgn007', '33333333-3333-3333-3333-333333333333', 'Basic Open Chords', 'Master G, C, D, Em, Am chords. Practice switching between them smoothly. Minimum 30 BPM.', NOW() + INTERVAL '14 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('asgn008', '33333333-3333-3333-3333-333333333333', 'Jazz Standard: Autumn Leaves', 'Learn chord melody arrangement. Focus on voice leading and smooth transitions between chords.', NOW() + INTERVAL '21 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- ============================================
-- ASSIGNMENT_STUDENTS (Assignments assigned to students)
-- ============================================

-- Emma Williams (Beginner) - Assigned C Major Scale and Sight Reading
INSERT INTO public.assignment_students (id, assignment_id, student_id, status, created_at, updated_at) VALUES
('as001', 'asgn001', '55555555-5555-5555-5555-555555555555', 'submitted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'),
('as002', 'asgn005', '55555555-5555-5555-5555-555555555555', 'pending', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- James Brown (Intermediate) - Assigned Minuet and Chord Progressions
INSERT INTO public.assignment_students (id, assignment_id, student_id, status, created_at, updated_at) VALUES
('as003', 'asgn002', '66666666-6666-6666-6666-666666666666', 'submitted', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'),
('as004', 'asgn003', '66666666-6666-6666-6666-666666666666', 'reviewed', NOW() - INTERVAL '9 days', NOW() - INTERVAL '4 days');

-- Sophia Davis (Advanced) - Assigned Chopin Nocturne
INSERT INTO public.assignment_students (id, assignment_id, student_id, status, created_at, updated_at) VALUES
('as005', 'asgn004', '77777777-7777-7777-7777-777777777777', 'submitted', NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day');

-- Alexander Taylor (Intermediate Guitar) - Assigned Blues Scale
INSERT INTO public.assignment_students (id, assignment_id, student_id, status, created_at, updated_at) VALUES
('as006', 'asgn006', '99999999-9999-9999-9999-999999999999', 'submitted', NOW() - INTERVAL '7 days', NOW() - INTERVAL '2 days');

-- Isabella Anderson (Beginner Guitar) - Assigned Basic Open Chords
INSERT INTO public.assignment_students (id, assignment_id, student_id, status, created_at, updated_at) VALUES
('as007', 'asgn007', 'aaaaaaaa-0000-0000-0000-000000000000', 'pending', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Ethan Thomas (Advanced Guitar) - Assigned Jazz Standard
INSERT INTO public.assignment_students (id, assignment_id, student_id, status, created_at, updated_at) VALUES
('as008', 'asgn008', 'bbbbbbbb-1111-1111-1111-111111111111', 'submitted', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day');

-- ============================================
-- ASSIGNMENT_FILES (Reference materials for assignments)
-- ============================================

INSERT INTO public.assignment_files (id, assignment_id, file_url, file_type, file_name, created_at) VALUES
('af001', 'asgn001', 'https://supabase.storage/scale-sheet-c-major.pdf', 'pdf', 'C_Major_Scale_Fingering.pdf', NOW() - INTERVAL '14 days'),
('af002', 'asgn002', 'https://supabase.storage/minuet-in-g-sheet.pdf', 'pdf', 'Minuet_in_G_Sheet_Music.pdf', NOW() - INTERVAL '12 days'),
('af003', 'asgn006', 'https://supabase.storage/blues-backing-track.mp3', 'audio', '12_Bar_Blues_A_Major.mp3', NOW() - INTERVAL '9 days'),
('af004', 'asgn008', 'https://supabase.storage/autumn-leads-sheet.pdf', 'pdf', 'Autumn_Leaves_Chart.pdf', NOW() - INTERVAL '5 days');

-- ============================================
-- SUBMISSIONS (Student submissions for assignments)
-- ============================================

-- Emma's submission for C Major Scale
INSERT INTO public.submissions (id, assignment_id, student_id, file_url, file_type, notes, submitted_at) VALUES
('sub001', 'asgn001', '55555555-5555-5555-5555-555555555555', 'https://supabase.storage/emma-c-scale.mp3', 'audio', 'I found the fingering tricky at first but it got better by the end. Had trouble with the 4th finger crossing.', NOW() - INTERVAL '2 days');

-- James' submission for Minuet in G
INSERT INTO public.submissions (id, assignment_id, student_id, file_url, file_type, notes, submitted_at) VALUES
('sub002', 'asgn002', '66666666-6666-6666-6666-666666666666', 'https://supabase.storage/james-minuet-video.mp4', 'video', 'Measures 8-12 are still a bit rough. I think I need to slow down the tempo there.', NOW() - INTERVAL '1 day');

-- Sophia's submission for Chopin Nocturne
INSERT INTO public.submissions (id, assignment_id, student_id, file_url, file_type, notes, submitted_at) VALUES
('sub003', 'asgn004', '77777777-7777-7777-7777-777777777777', 'https://supabase.storage/sophia-chopin.mp3', 'audio', 'Working on the rubato as we discussed. I tried to be more expressive in the B section. Still perfecting the ornamentation in measures 28-30.', NOW() - INTERVAL '1 day');

-- Alexander's submission for Blues Improvisation
INSERT INTO public.submissions (id, assignment_id, student_id, file_url, file_type, notes, submitted_at) VALUES
('sub004', 'asgn006', '99999999-9999-9999-9999-999999999999', 'https://supabase.storage/alex-blues-solo.mp3', 'audio', 'Tried to incorporate some BB King style bends. The turnarounds at bars 11-12 need work.', NOW() - INTERVAL '2 days');

-- Ethan''s submission for Autumn Leaves
INSERT INTO public.submissions (id, assignment_id, student_id, file_url, file_type, notes, submitted_at) VALUES
('sub005', 'asgn008', 'bbbbbbbb-1111-1111-1111-111111111111', 'https://supabase.storage/ethan-autumn-leaves.mp4', 'video', 'Focusing on the voice leading as discussed. I think the chord voicings are better this week. The melody line needs to be more prominent.', NOW() - INTERVAL '1 day');

-- ============================================
-- FEEDBACK (Teacher feedback on submissions)
-- ============================================

-- Sarah's feedback on Emma's C Major Scale
INSERT INTO public.feedback (id, submission_id, teacher_id, content, rating, created_at) VALUES
('fdb001', 'sub001', '11111111-1111-1111-1111-111111111111', 'Great effort, Emma! Your finger positioning has improved significantly. I noticed you were more comfortable with the 3rd and 4th fingers on the descent. Try practicing with the metronome at 70 BPM for next week to build consistency. The thumb crossing under is much smoother than last time. Keep it up!', 4, NOW() - INTERVAL '1 day');

-- Sarah's feedback on James' Minuet
INSERT INTO public.feedback (id, submission_id, teacher_id, content, rating, created_at) VALUES
('fdb002', 'sub002', '11111111-1111-1111-1111-111111111111', 'Excellent progress, James! The phrasing in the opening is lovely. You''re absolutely right about measures 8-12 - try practicing just that section hands separately at a slower tempo. The dynamics are coming along well. Remember to hold the half notes their full value. Overall, a very musical performance!', 5, NOW() - INTERVAL '12 hours');

-- Sarah's feedback on Sophia's Chopin
INSERT INTO public.feedback (id, submission_id, teacher_id, content, rating, created_at) VALUES
('fdb003', 'sub003', '11111111-1111-1111-1111-111111111111', 'Sophia, this is absolutely beautiful! The rubato in the B section feels very natural. You''ve captured the emotional essence of the piece. The ornamentation in m.28-30 is clean and elegant. For next week, let''s work on bringing out the inner voices more clearly. Listen to the countermelody in the left hand during the A'' section.', 5, NOW() - INTERVAL '10 hours');

-- Michael's feedback on Alexander's Blues
INSERT INTO public.feedback (id, submission_id, teacher_id, content, rating, created_at) VALUES
('fdb004', 'sub004', '33333333-3333-3333-3333-333333333333', 'Great blues feel, Alexander! The BB King style bends are spot on. Your vibrato has improved dramatically. For the turnaround at bars 11-12, try using the pattern I showed you in our last lesson. The timing is slightly off there. The rest of the solo has great flow. Keep experimenting with different positions on the neck.', 4, NOW() - INTERVAL '1 day');

-- Michael's feedback on Ethan's Jazz Standard
INSERT INTO public.feedback (id, submission_id, teacher_id, content, rating, created_at) VALUES
('fdb005', 'sub005', '33333333-3333-3333-3333-333333333333', 'Excellent work on the chord melody, Ethan! The voice leading is smooth and the voicings are creative. Your fingerstyle technique is solid. To make the melody more prominent, try slightly increasing the attack on the melody notes and maybe bring the inner voices down just a touch. The overall arrangement is very musical. Let''s add the bridge section for next week.', 5, NOW() - INTERVAL '8 hours');

-- ============================================
-- PRACTICE_LOGS (Student practice sessions)
-- ============================================

-- Emma's practice logs
INSERT INTO public.practice_logs (id, student_id, date, duration_minutes, notes, created_at) VALUES
('prc001', '55555555-5555-5555-5555-555555555555', (NOW() - INTERVAL '1 day')::DATE, 30, 'Worked on C major scale. Started at 60 BPM, increased to 70 by end of session.', NOW() - INTERVAL '1 day'),
('prc002', '55555555-5555-5555-5555-555555555555', (NOW() - INTERVAL '2 days')::DATE, 45, 'Practiced scale and started sight reading new piece. Focused on even tempo.', NOW() - INTERVAL '2 days'),
('prc003', '55555555-5555-5555-5555-555555555555', (NOW() - INTERVAL '4 days')::DATE, 30, 'Scale practice and chord exercises. Left hand felt stronger today.', NOW() - INTERVAL '4 days');

-- James' practice logs
INSERT INTO public.practice_logs (id, student_id, date, duration_minutes, notes, created_at) VALUES
('prc004', '66666666-6666-6666-6666-666666666666', (NOW() - INTERVAL '1 day')::DATE, 60, 'Worked on Minuet measures 8-12 hands separately. Need more work on this section.', NOW() - INTERVAL '1 day'),
('prc005', '66666666-6666-6666-6666-666666666666', (NOW() - INTERVAL '3 days')::DATE, 45, 'Full piece run-through three times. Dynamics improving.', NOW() - INTERVAL '3 days'),
('prc006', '66666666-6666-6666-6666-666666666666', (NOW() - INTERVAL '5 days')::DATE, 50, 'Chord progressions practice. Transposed to D major successfully.', NOW() - INTERVAL '5 days');

-- Sophia's practice logs (extensive practice as advanced student)
INSERT INTO public.practice_logs (id, student_id, date, duration_minutes, notes, created_at) VALUES
('prc007', '77777777-7777-7777-7777-777777777777', (NOW() - INTERVAL '1 day')::DATE, 120, 'Full Chopin nocturne study. Spent extra time on rubato sections.', NOW() - INTERVAL '1 day'),
('prc008', '77777777-7777-7777-7777-777777777777', (NOW() - INTERVAL '2 days')::DATE, 90, 'Technical work on ornamentation. Slow practice with metronome.', NOW() - INTERVAL '2 days'),
('prc009', '77777777-7777-7777-7777-777777777777', (NOW() - INTERVAL '3 days')::DATE, 150, 'Performed at piano society. Recorded piece for submission.', NOW() - INTERVAL '3 days'),
('prc010', '77777777-7777-7777-7777-777777777777', (NOW() - INTERVAL '4 days')::DATE, 105, 'New piece sight reading and analysis. Worked on harmonic structure.', NOW() - INTERVAL '4 days');

-- Alexander's practice logs
INSERT INTO public.practice_logs (id, student_id, date, duration_minutes, notes, created_at) VALUES
('prc011', '99999999-9999-9999-9999-999999999999', (NOW() - INTERVAL '1 day')::DATE, 75, 'Blues scale in 5 positions. Improvisation over backing track.', NOW() - INTERVAL '1 day'),
('prc012', '99999999-9999-9999-9999-999999999999', (NOW() - INTERVAL '2 days')::DATE, 60, 'Bend practice and vibrato exercises. String skipping drills.', NOW() - INTERVAL '2 days'),
('prc013', '99999999-9999-9999-9999-999999999999', (NOW() - INTERVAL '4 days')::DATE, 80, 'Worked on original composition. Blues influences.', NOW() - INTERVAL '4 days');

-- Ethan's practice logs
INSERT INTO public.practice_logs (id, student_id, date, duration_minutes, notes, created_at) VALUES
('prc014', 'bbbbbbbb-1111-1111-1111-111111111111', (NOW() - INTERVAL '1 day')::DATE, 110, 'Chord melody arrangement. Focused on voice leading in bridge section.', NOW() - INTERVAL '1 day'),
('prc015', 'bbbbbbbb-1111-1111-1111-111111111111', (NOW() - INTERVAL '2 days')::DATE, 95, 'Jazz standards repertoire review. Analyzed chord substitutions.', NOW() - INTERVAL '2 days'),
('prc016', 'bbbbbbbb-1111-1111-1111-111111111111', (NOW() - INTERVAL '3 days')::DATE, 120, 'Gig performance preparation. Recorded practice session for review.', NOW() - INTERVAL '3 days'),
('prc017', 'bbbbbbbb-1111-1111-1111-111111111111', (NOW() - INTERVAL '5 days')::DATE, 85, 'Improvisation over changes. Transcribed Wes Montgomery solo.', NOW() - INTERVAL '5 days');

-- Isabella's practice logs (beginner - less frequent)
INSERT INTO public.practice_logs (id, student_id, date, duration_minutes, notes, created_at) VALUES
('prc018', 'aaaaaaaa-0000-0000-0000-000000000000', (NOW() - INTERVAL '2 days')::DATE, 25, 'Chord transitions: G to C. Still building finger strength.', NOW() - INTERVAL '2 days'),
('prc019', 'aaaaaaaa-0000-0000-0000-000000000000', (NOW() - INTERVAL '4 days')::DATE, 30, 'Basic strumming patterns. Getting better at keeping rhythm.', NOW() - INTERVAL '4 days'),
('prc020', 'aaaaaaaa-0000-0000-0000-000000000000', (NOW() - INTERVAL '7 days')::DATE, 20, 'Finger exercises and basic chords. Some finger soreness.', NOW() - INTERVAL '7 days');

-- ============================================
-- SEEDING COMPLETE
-- ============================================

-- Uncomment the line below to verify the data was inserted correctly
-- SELECT 'Teachers: ' || COUNT(*) FROM public.teacher_profiles;
-- SELECT 'Students: ' || COUNT(*) FROM public.student_profiles;
-- SELECT 'Assignments: ' || COUNT(*) FROM public.assignments;
-- SELECT 'Submissions: ' || COUNT(*) FROM public.submissions;
-- SELECT 'Practice Logs: ' || COUNT(*) FROM public.practice_logs;
-- SELECT 'Feedback Entries: ' || COUNT(*) FROM public.feedback;
