export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
  return null
}

export function validateRegister(
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!fullName.trim() || fullName.trim().length < 2) {
    errors.fullName = 'Họ tên phải có ít nhất 2 ký tự'
  }
  if (!isValidEmail(email)) {
    errors.email = 'Email không hợp lệ'
  }
  const pwError = validatePassword(password)
  if (pwError) errors.password = pwError
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp'
  }
  return errors
}

export function validateLogin(email: string, password: string): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!isValidEmail(email)) errors.email = 'Email không hợp lệ'
  if (!password) errors.password = 'Vui lòng nhập mật khẩu'
  return errors
}

export function validateBookForm(data: {
  title: string
  category: string
  condition: string
  exchangeType: string
  description: string
}): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.title.trim() || data.title.trim().length < 2) {
    errors.title = 'Tên sách phải có ít nhất 2 ký tự'
  }
  if (!data.category) errors.category = 'Vui lòng chọn thể loại'
  if (!data.condition) errors.condition = 'Vui lòng chọn tình trạng'
  if (!data.exchangeType) errors.exchangeType = 'Vui lòng chọn hình thức'
  if (!data.description.trim() || data.description.trim().length < 20) {
    errors.description = 'Mô tả phải có ít nhất 20 ký tự'
  }
  return errors
}
