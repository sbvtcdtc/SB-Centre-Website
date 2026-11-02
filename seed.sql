-- SB Centre — seed data ONLY (already-approved demo data, nothing invented).
-- Run AFTER schema.sql. Contact fields, teacher, achievements and success
-- stories are intentionally left empty for the owner to fill in admin.

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;

-- Courses N5 / N4 / N3 — descriptions as in the approved public site.
insert into public.courses (id, level, title_bn, title_en, title_ja, audience_bn, audience_en, audience_ja, duration_months, hours, description_bn, description_en, description_ja, sort_order) values
('N5','N5','Basic Japanese Language Course — N5','Basic Japanese Language Course — N5','基礎日本語コース — N5','সম্পূর্ণ নতুনদের জন্য','For complete beginners','まったくの初心者向け',3,180,
'যারা একদম শূন্য থেকে জাপানি শুরু করতে চান, তাদের জন্য এই কোর্স। হিরাগানা ও কাতাকানা থেকে শুরু করে মৌলিক কাঞ্জি, দৈনন্দিন ব্যাকরণ ও সাধারণ কথোপকথনে আত্মবিশ্বাস তৈরি করা হয়। JLPT N5 ও JFT-Basic পরীক্ষার পূর্ণ প্রস্তুতি।',
'For those starting Japanese from zero. From hiragana and katakana to basic kanji, everyday grammar and confident everyday conversation, with full preparation for JLPT N5 and JFT-Basic.',
'ゼロから日本語を始める方のためのコースです。ひらがな・カタカナから基本漢字、日常文法、日常会話の自信までを身につけ、JLPT N5とJFT-Basicの万全な対策を行います。',1),
('N4','N4','Elementary Japanese Language Course — N4','Elementary Japanese Language Course — N4','初級日本語コース — N4','N5 সম্পন্নদের জন্য','For those who completed N5','N5修了者向け',3,180,
'N5-এর ভিত্তির ওপর দাঁড়িয়ে আরও গভীর ব্যাকরণ, বিস্তৃত শব্দভাণ্ডার ও প্রায় ৩০০ কাঞ্জি শেখানো হয়। কর্মক্ষেত্র ও দৈনন্দিন জীবনের জটিল কথোপকথন, ভদ্র ভাষা (কেইগো-র প্রাথমিক ধারণা) ও JLPT N4 পরীক্ষার পূর্ণ প্রস্তুতি এই কোর্সে থাকে।',
'Building on N5: deeper grammar, wider vocabulary and about 300 kanji. Workplace and everyday complex conversation, an introduction to polite language (keigo), and full JLPT N4 preparation.',
'N5の基礎の上に、より深い文法、広い語彙、約300字の漢字を学びます。職場や日常生活の複雑な会話、敬語の初歩、JLPT N4の万全な対策が含まれます。',2),
('N3','N3','Intermediate Japanese Language Course — N3','Intermediate Japanese Language Course — N3','中級日本語コース — N3','N4 সম্পন্নদের জন্য','For those who completed N4','N4修了者向け',4,200,
'মধ্যম স্তরের এই কোর্সে প্রায় ৬৫০ কাঞ্জি, উন্নত ব্যাকরণ ও স্বাভাবিক গতির কথোপকথনে সাবলীলতা আনা হয়। জাপানের কর্মক্ষেত্রে স্বাধীনভাবে যোগাযোগ এবং JLPT N3 পাসের জন্য যা যা দরকার, তার পূর্ণ প্রস্তুতি দেওয়া হয়।',
'Intermediate level: about 650 kanji, advanced grammar and fluency in natural-speed conversation, with full preparation to communicate independently at work in Japan and pass JLPT N3.',
'中級コースでは約650字の漢字、上級文法、自然な速さの会話での流暢さを身につけ、日本の職場での自立したコミュニケーションとJLPT N3合格のための万全な対策を行います。',3)
on conflict (id) do nothing;

-- Demo student (approved demo data only)
insert into public.students (roll, name, course, status) values
('SB-001','ABU BAKAR RIYAD','N5','')
on conflict (roll) do nothing;

-- Demo certificate (approved demo data only)
insert into public.certificates (student_name, license_no, level, course_name, start_date, end_date, duration_months, hours, issue_date) values
('ABU BAKAR RIYAD','SBVTC/N5/2026/00427','N5','Basic Japanese Language Course','2026-01-07','2026-03-07',3,180,'2026-03-07')
on conflict (license_no) do nothing;

-- Notices, October 2026 (as in the approved site)
insert into public.notices (title, body, notice_date, sort_order) values
('নতুন N5 ব্যাচে ভর্তি চলছে','নতুন Basic Japanese Language Course (N5) ব্যাচ শীঘ্রই শুরু হচ্ছে। আগ্রহীরা অফিসে যোগাযোগ করুন অথবা আমাদের Facebook পেজে মেসেজ দিন। আসন সীমিত।','2026-10-30',1),
('বৃহস্পতিবারের অনলাইন ক্লাস','প্রতি বৃহস্পতিবার অনলাইন ক্লাস অনুষ্ঠিত হয় — সাধারণত দুপুর ১২টা থেকে (মাঝে মাঝে সকাল ৯টা থেকে)। ক্লাসের লিংক ও সময় আগের দিন জানিয়ে দেওয়া হবে।','2026-10-26',2);
-- Teachers, achievements, success stories, gallery, slideshow: intentionally empty.
-- The owner adds them in admin.html. No teacher name, achievement, contact
-- phone/email/address or WhatsApp number is invented here.
