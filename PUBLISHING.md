# Hướng dẫn xuất bản SDK lên NPM

Dưới đây là các bước để xuất bản `iap-verification-sdk` lên NPM.

## 1. Chuẩn bị tài khoản NPM

Nếu bạn chưa có tài khoản NPM, hãy đăng ký tại [npmjs.com](https://www.npmjs.com/signup).

```bash
# Đăng nhập vào NPM từ command line
npm login
```

Nhập tên người dùng, mật khẩu và email của bạn để đăng nhập.

## 2. Chuẩn bị package

### Cập nhật thông tin package

Mở file `package.json` và đảm bảo các thông tin sau đã được cập nhật:

```json
{
  "name": "iap-verification-sdk", // Tên package, có thể là "@your-org/iap-verification-sdk" cho scoped package
  "version": "1.0.0", // Phiên bản, tuân theo Semantic Versioning
  "description": "SDK for verifying in-app purchases from Google Play and Apple App Store",
  "main": "src/index.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/iap-verification-sdk.git"
  },
  "keywords": ["iap", "in-app-purchase", "google-play", "app-store", "verification"],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/your-username/iap-verification-sdk/issues"
  },
  "homepage": "https://github.com/your-username/iap-verification-sdk#readme"
}
```

### Tạo file `.npmignore`

Tạo file `.npmignore` để loại bỏ các file không cần thiết khi xuất bản:

```
# File cấu hình phát triển
.gitignore
.eslintrc.js
.prettierrc
.github

# Thư mục phát triển
test/
examples/
docs/
coverage/

# Các file tạm thời
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
```

## 3. Kiểm tra package

### Kiểm tra lỗi

```bash
# Kiểm tra lỗi cú pháp
npx eslint .

# Chạy unit test nếu có
npm test
```

### Tạo bản build local

```bash
# Tạo package tạm thời
npm pack
```

Lệnh này sẽ tạo một file `.tgz` chứa nội dung sẽ được xuất bản lên NPM. Bạn có thể giải nén và kiểm tra nội dung của file này để đảm bảo mọi thứ đều đúng.

## 4. Xuất bản lên NPM

### Xuất bản phiên bản đầu tiên

```bash
# Xuất bản package
npm publish
```

Nếu bạn muốn xuất bản một scoped package (như `@your-org/iap-verification-sdk`), nhưng muốn nó là public, hãy sử dụng:

```bash
npm publish --access=public
```

### Xuất bản phiên bản mới

Khi bạn cần cập nhật package:

1. Cập nhật mã nguồn
2. Cập nhật phiên bản trong `package.json` theo quy tắc Semantic Versioning:
   - **Patch (1.0.0 -> 1.0.1)**: Sửa lỗi, không thay đổi API
   - **Minor (1.0.0 -> 1.1.0)**: Thêm tính năng mới, không phá vỡ tương thích ngược
   - **Major (1.0.0 -> 2.0.0)**: Thay đổi làm phá vỡ tương thích ngược

```bash
# Tăng phiên bản tự động
npm version patch  # hoặc minor, major

# Xuất bản phiên bản mới
npm publish
```

## 5. Quản lý phiên bản

### Gắn thẻ phiên bản

```bash
# Tạo git tag cho phiên bản
git tag v1.0.0
git push origin v1.0.0
```

### Phát hành Beta

Nếu bạn muốn phát hành phiên bản beta:

```bash
# Cập nhật phiên bản trong package.json thành "1.0.0-beta.1"
npm version 1.0.0-beta.1

# Xuất bản với tag beta
npm publish --tag beta
```

Người dùng có thể cài đặt phiên bản beta bằng:

```bash
npm install iap-verification-sdk@beta
```

## 6. Cập nhật tài liệu

Sau khi xuất bản, hãy cập nhật tài liệu README.md của bạn với hướng dẫn cài đặt:

```markdown
## Cài đặt

```bash
npm install iap-verification-sdk --save
```
```

## 7. Lệnh npm đầy đủ để xuất bản

Dưới đây là các lệnh đầy đủ để xuất bản package:

```bash
# Đăng nhập vào npm
npm login

# Cập nhật phiên bản
npm version patch  # hoặc minor, major

# Tạo package để kiểm tra
npm pack

# Xuất bản lên npm
npm publish

# Tạo git tag và push
git tag v$(node -p "require('./package.json').version")
git push origin v$(node -p "require('./package.json').version")
```

## 8. Các lưu ý bảo mật

- **Không bao gồm khóa API hoặc thông tin nhạy cảm** trong mã nguồn
- **Kiểm tra dependencies** để tránh các lỗ hổng bảo mật
- **Xác minh package.json** để đảm bảo không có scripts độc hại

---

Sau khi xuất bản, SDK của bạn sẽ có sẵn tại `https://www.npmjs.com/package/iap-verification-sdk` và người dùng có thể cài đặt nó bằng `npm install iap-verification-sdk`.