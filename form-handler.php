<?php
/**
 * Alagar Public School — website form handler
 * Receives all website form submissions (JSON POST) and emails them to the
 * school office. No third-party service, no stored files — email only.
 *
 * Handles five form types (set by the "formType" field in the payload):
 *   contact    — Contact page message form
 *   feedback   — Parent feedback form
 *   admission  — Admission Enquiry popup
 *   campus     — Book a Campus Visit popup
 *   newsletter — News & Events subscribe form
 *
 * Forms post here via fetch(). Same origin, so no CORS setup needed.
 */

header('Content-Type: application/json; charset=utf-8');

// ---------- CONFIG ----------
$ALERT_EMAIL = 'alagarschool@gmail.com';       // where submissions are sent
$FROM_EMAIL  = 'no-reply@alagarschool.in';     // must be on your domain
// ----------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['result' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Read JSON body (fall back to form-encoded)
$raw = file_get_contents('php://input');
$d   = json_decode($raw, true);
if (!is_array($d)) { $d = $_POST; }

function clean($v) { return trim(is_string($v) ? $v : ''); }
// Strip CR/LF so no value can inject extra email headers
function hsafe($v) { return str_replace(["\r", "\n"], ' ', clean($v)); }
// Escape a value for safe inclusion in the HTML email
function esc($v) { return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8'); }

// Honeypot: bots fill hidden fields — silently accept, send nothing
if (!empty($d['_gotcha'])) { echo json_encode(['result' => 'success']); exit; }

// Per-form definition: the fields we keep (whitelist + display order),
// which are required, and how the email subject is built.
$FORMS = [
    'contact' => [
        'heading'  => 'New contact enquiry from the website',
        'fields'   => ['Name', 'Phone', 'Email', 'Message'],
        'required' => ['Name', 'Phone'],
        'subject'  => ['Website Enquiry — ', 'Name'],
    ],
    'feedback' => [
        'heading'  => 'New parent feedback from the website',
        'fields'   => ['Parent Name', 'Student Name', 'Class', 'Phone', 'Email', 'Rating', 'Topic', 'Feedback', 'Consent'],
        'required' => ['Parent Name', 'Phone', 'Rating', 'Feedback'],
        'subject'  => ['Parent Feedback — ', 'Parent Name'],
    ],
    'admission' => [
        'heading'  => 'New admission enquiry from the website',
        'fields'   => ['Student Name', 'Date of Birth', 'Age', 'Grade Seeking', 'Parent / Guardian', 'Contact Number', 'Email'],
        'required' => ['Student Name', 'Grade Seeking', 'Parent / Guardian', 'Contact Number'],
        'subject'  => ['Admission Enquiry — ', 'Student Name'],
    ],
    'campus' => [
        'heading'  => 'New campus visit request from the website',
        'fields'   => ['Parent / Guardian', 'Mobile Number', 'Preferred Visit Date', 'Preferred Time', 'Email'],
        'required' => ['Parent / Guardian', 'Mobile Number', 'Preferred Visit Date', 'Preferred Time'],
        'subject'  => ['Campus Visit Request — ', 'Parent / Guardian'],
    ],
    'newsletter' => [
        'heading'  => 'New newsletter subscription from the website',
        'fields'   => ['Email'],
        'required' => ['Email'],
        'subject'  => ['Newsletter Subscription — ', 'Email'],
    ],
];

$formType = strtolower(clean($d['formType'] ?? 'contact'));
if (!isset($FORMS[$formType])) { $formType = 'contact'; }
$cfg = $FORMS[$formType];

// Collect only the whitelisted fields, in display order
$fields = [];
foreach ($cfg['fields'] as $name) { $fields[$name] = clean($d[$name] ?? ''); }

// Server-side required-field check
foreach ($cfg['required'] as $name) {
    if ($fields[$name] === '') {
        http_response_code(422);
        echo json_encode(['result' => 'error', 'message' => 'Missing required fields']);
        exit;
    }
}

// Subject line
$subjectName = $fields[$cfg['subject'][1]] ?? '';
$subject     = $cfg['subject'][0] . ($subjectName !== '' ? $subjectName : 'Alagar Public School');
if ($formType === 'feedback' && $fields['Rating'] !== '') {
    $subject .= ' (' . $fields['Rating'] . ')';
}

$submittedAt = date('d M Y, g:i A');
$replyable   = filter_var($fields['Email'] ?? '', FILTER_VALIDATE_EMAIL) !== false;

// ---- plain-text part (fallback for non-HTML clients) ----
$lines = [$cfg['heading'], str_repeat('-', 40)];
foreach ($fields as $k => $v) {
    if ($v !== '') { $lines[] = str_pad($k . ':', 22) . $v; }
}
$lines[] = '';
$lines[] = 'Submitted: ' . $submittedAt;
$textBody = implode("\n", $lines);

// ---- HTML part (branded, table-based for email-client compatibility) ----
$rows = '';
foreach ($fields as $k => $v) {
    if ($v === '') { continue; }
    $rows .= '<tr>'
        . '<td style="padding:11px 0;border-bottom:1px solid #eef1ee;color:#6b756b;font-size:13px;width:42%;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">' . esc($k) . '</td>'
        . '<td style="padding:11px 0 11px 16px;border-bottom:1px solid #eef1ee;color:#1a231a;font-size:14px;font-weight:bold;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">' . nl2br(esc($v)) . '</td>'
        . '</tr>';
}
$replyNote = $replyable ? ' &nbsp;·&nbsp; Hit <b style="color:#4a7a52;">Reply</b> to respond directly to the sender.' : '';

$htmlBody =
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
. '<body style="margin:0;padding:0;background:#eef1ee;">'
. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1ee;padding:26px 12px;">'
. '<tr><td align="center">'
. '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">'
// header
. '<tr><td style="background:#2f8f3e;background:linear-gradient(135deg,#2f8f3e,#246a2f);padding:24px 30px;">'
. '<div style="color:#ffffff;font-size:19px;font-weight:bold;letter-spacing:.2px;font-family:Arial,Helvetica,sans-serif;">Alagar Public School</div>'
. '<div style="color:#d7efdc;font-size:13px;margin-top:4px;font-family:Arial,Helvetica,sans-serif;">' . esc($cfg['heading']) . '</div>'
. '</td></tr>'
// body
. '<tr><td style="padding:24px 30px 8px;">'
. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $rows . '</table>'
. '</td></tr>'
// footer
. '<tr><td style="padding:14px 30px 26px;">'
. '<div style="color:#8a938a;font-size:12px;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">'
. 'Submitted ' . esc($submittedAt) . $replyNote
. '<br>Sent automatically from the Alagar Public School website.'
. '</div>'
. '</td></tr>'
. '</table></td></tr></table></body></html>';

// ---- assemble a multipart/alternative message (text + HTML) ----
$boundary = '=_aps_' . md5(uniqid((string) mt_rand(), true));
$headers  = 'From: Alagar Website <' . $FROM_EMAIL . ">\r\n";
if ($replyable) {
    $headers .= 'Reply-To: ' . hsafe($fields['Email']) . "\r\n";
}
$headers .= "MIME-Version: 1.0\r\n";
$headers .= 'Content-Type: multipart/alternative; boundary="' . $boundary . "\"\r\n";

$message  = '--' . $boundary . "\r\n"
          . "Content-Type: text/plain; charset=UTF-8\r\n"
          . "Content-Transfer-Encoding: 8bit\r\n\r\n"
          . $textBody . "\r\n\r\n"
          . '--' . $boundary . "\r\n"
          . "Content-Type: text/html; charset=UTF-8\r\n"
          . "Content-Transfer-Encoding: 8bit\r\n\r\n"
          . $htmlBody . "\r\n\r\n"
          . '--' . $boundary . "--\r\n";

if (mail($ALERT_EMAIL, hsafe($subject), $message, $headers)) {
    echo json_encode(['result' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['result' => 'error', 'message' => 'Could not send email']);
}
