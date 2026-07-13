# WP-01 — Auth (Splash + Login) — extracted-portal

## Mục tiêu
Entry gate **giống 100%** preview `localhost:4178` (splash → login).  
**Không** làm OTP / Google từ SRS-06 ở WP này → [`../work-packages-supplemental/SUPP-01-auth-srs06.md`](../work-packages-supplemental/SUPP-01-auth-srs06.md).

## Nguồn HTML (duy nhất)
| Màn | Path | Lines |
|-----|------|-------|
| Shell gradient | `extracted-portal/template.html` | ~2093–2097 |
| Splash | `isSplash` | ~2099–2111 |
| Login card | `isLogin` | ~2113–2127 |
| Default state | `logic.js` | `entryStep`, `loginEmail`, `loginPass` |

Preview: chạy `node server.mjs` → mở template → màn login (logo Rikkei, card trắng).

## UI phải khớp (checklist so preview)
**Splash**
- [x] Nền gradient wine → deep
- [x] Blob vàng / trắng góc
- [x] Logo trong card trắng bo góc
- [x] Headline + subtitle + CTA “Bắt đầu →”
- [x] 3 feature chips

**Login**
- [x] Cùng nền gradient + blobs
- [x] Card trắng `border-radius: 26px`, padding ~34×32
- [x] Logo `rikkei-logo.png` (không thay bằng chữ “LMS Portal”)
- [x] Title “Đăng nhập” + welcome line
- [x] Label “Email sinh viên” + “Mật khẩu”
- [x] Input nền cream, border line, focus wine
- [x] “Quên mật khẩu?” căn phải
- [x] Nút gradient wine-bright → wine (không Google / remember me / footer admin)

## Target code
| File | Action |
|------|--------|
| `src/views/login-view.tsx` | Splash + login steps khớp EP |
| `src/components/ui/auth/auth-splash.tsx` | Splash EP |
| `src/components/ui/auth/login-form.tsx` | Form đúng EP |
| `src/components/layout/auth/auth-shell.tsx` | Gradient + blobs như EP |
| `public/assets/rikkei-logo.png` | Copy từ `extracted-portal/assets/` |
| `src/mocks/auth.mock.ts` | Email/password demo từ `logic.js` |
| `UI_TEXT.auth.*` | Copy đúng chữ EP |

## Đã xóa (không thuộc WP-01)
- `/otp` route, `otp-view`, `otp-input`
- Google / remember me / OTP constants & schema

## DoD
- [x] Side-by-side với `localhost:4178` — login/splash theo EP
- [x] Không phụ thuộc `chi-tiet/SRS-06`
- [x] Mock trong `src/mocks/`
- [x] type-check + lint pass

## Prompt
> Implement WP-01 from extracted-portal template.html ~2093–2127 only. Match localhost:4178 pixel-close. No SRS-06 OTP/Google.
