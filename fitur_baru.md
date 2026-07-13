1. Konsep Fitur Collaboration Docsly

Nama fitur:

Docsly Collaboration

Tujuan:

Memungkinkan pengguna bekerja bersama dalam satu dokumen secara real-time, sambil tetap menjaga privasi workspace dan personalisasi AI setiap pengguna.

Menurut saya keputusan kamu memisahkan:

Dokumen bersama
Workspace pribadi
AI Chat pribadi

adalah keputusan yang sangat tepat.

Karena masalah yang sering muncul pada collaborative app:

"Ketika dokumen dibagikan, semua data pengguna ikut terbuka."

Docsly jangan seperti itu.

2. Struktur Workspace yang Kamu Inginkan

Menurut saya modelnya seperti ini:

Owner Workspace

Contoh:

Rafi memiliki:

Workspace:
Skripsi Rafi

Documents:

📄 Bab 1
📄 Bab 2
📄 Proposal
📄 Referensi

Kemudian Rafi share:

Proposal.docx

kepada Ahmad.

Maka Ahmad TIDAK mendapatkan:

Workspace Rafi

Tetapi:

Workspace:

Shared With Me

📄 Proposal.docx

Invited by:
rafi@email.com

Jadi di database sebenarnya:

Workspace tetap milik Rafi.

Ahmad hanya punya:

Document Access Permission

bukan:

Workspace Permission

Ini sangat penting.

3. Flow User Share Document

Di editor:

              Share
                ↓
        Open Share Modal

Popup:

---------------------------------

Share "Proposal AI"


People with access:

Rafi
Owner


Invite people:

[email@example.com]

Permission:

[Can Edit ▼]


Generate Link


Link Access:

○ Restricted

○ Anyone with link


Permission:

Can View
Can Edit


               Copy Link

---------------------------------
Permission Mode

Saya sarankan hanya 2 dulu:

Viewer

Bisa:

✓ Membaca dokumen
✓ Melihat komentar (nanti)
✓ Export jika diberikan

Tidak bisa:

❌ Edit
❌ Mengubah format
❌ Menghapus

Editor

Bisa:

✓ Edit isi
✓ Mengubah format
✓ Menambah halaman
✓ Menggunakan AI pada dokumen

Tidak bisa:

❌ Menghapus owner
❌ Menghapus akses owner
❌ Mengubah permission user lain

4. Flow Invite Link

Misalnya:

Rafi membuat:

docsly.com/invite/abc123

Ahmad klik:

Invite Link
        |
        ↓
Login
        |
        ↓
Accept Invitation
        |
        ↓
Document masuk ke Workspace Ahmad

Tapi:

Bukan:

My Workspace

melainkan:

Shared Documents

Card:

--------------------------------

Proposal AI

Shared Document

Invited by:
rafi@email.com


Role:
Editor


Last activity:
5 minutes ago

--------------------------------
5. Database Architecture

Saya tidak menyimpan member di workspace.

Saya buat khusus:

documents
id

workspace_id

owner_id

title

content

created_at
document_members

Ini inti collaboration.

id

document_id

user_id

role

invited_by

created_at

last_seen

Contoh:

document_id:
123

user:
Ahmad

role:
EDITOR

Role:

OWNER

EDITOR

VIEWER
6. AI Chat Personal (Ini Ide Bagus)

Menurut saya jangan gabungkan AI Chat.

Karena:

Rafi mungkin bertanya:

"Buatkan BAB 3"

Ahmad mungkin bertanya:

"Ringkas bagian metodologi"

Kalau digabung:

History kacau.

Jadi buat:

document_ai_sessions
id

document_id

user_id

messages

created_at

Relasi:

Document
    |
    |
    +---- Rafi AI Chat

    |
    +---- Ahmad AI Chat
7. Real-time Cursor & User Presence

Ini bagian paling sulit.

Untuk ini saya tidak menyarankan membuat dari nol.

Gunakan:

Yjs + Tiptap Collaboration

Karena Docsly menggunakan Tiptap.

Ini sangat cocok.

Stack:

Tiptap

+

Yjs

+

WebSocket Provider

+

Supabase Realtime / Hocuspocus

Arsitektur:

User A

Tiptap Editor

       |
       |
     Yjs


       |
 WebSocket Server


       |

User B

Yang bisa didapat:

✓ Real-time typing

✓ Cursor position

✓ Selection highlight

✓ Presence

✓ User online

Contoh:

Editor:

BAB 1 Pendahuluan


[Rafi cursor]
warna biru


[Ahmad cursor]
warna hijau
8. User Online

Di kanan atas editor:

Currently viewing:

🟢 Rafi
🟢 Ahmad
🟡 Budi

Klik:

People in document

Rafi
Owner

Ahmad
Editor

Budi
Viewer
9. Kick Member

Ini masuk permission management.

Owner:

klik:

Ahmad

Role:
Editor ▼


Remove access

Database:

hapus:

document_members

Realtime:

broadcast:

USER_REMOVED

Ahmad:

Access removed

Redirecting...
10. Version History

Menurut saya ini wajib karena dokumen kolaborasi.

Struktur:

document_versions
id

document_id

created_by

snapshot

description

created_at

Contoh:

Version History


Today


10:20

Rafi edited document


09:15

Ahmad changed title


Yesterday

Rafi created version

Ketika save:

Simpan:

Who:
Ahmad

When:
10:20


Change:
Added section methodology
11. Perubahan Dokumen Real-time

Jangan setiap karakter membuat version.

Berbahaya.

Gunakan:

Auto version snapshot

Contoh:

Setiap:

5 menit
Manual save
Major change
12. UI Design Recommendation

Jangan membuat banyak panel.

Google Docs terlalu kompleks.

Docsly harus clean.

Saya sarankan:

Editor Header
Proposal AI


🟢 Rafi
🟢 Ahmad
        Share
        History

Share modal:

Simple.

Right panel:

AI Chat tetap:

AI Assistant

Personal chat

Version:

Drawer kanan:

Version History
13. Hal yang Saya Sarankan Jangan Dibuat Dulu

Untuk tahap awal jangan langsung:

❌ Comment system kompleks

❌ Suggesting mode seperti Word

❌ Track changes

❌ Multiple cursor editing advanced

❌ Permission bertingkat banyak

Karena itu akan memperlama development