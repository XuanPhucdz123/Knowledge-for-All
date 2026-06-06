import { MessageCircle, Send, Sparkles, Users } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FadeIn } from '../components/FadeIn'
import { GradientButton } from '../components/GradientButton'
import { Magnetic } from '../components/Magnetic'
import { useAuth } from '../hooks/useAuth'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { DEMO_CHATS, ILLUSTRATIONS } from '../lib/images'

gsap.registerPlugin(ScrollTrigger)

export function InboxSection() {
  const { user } = useAuth()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced || !sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.inbox-float', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
      })
      if (phoneRef.current) {
        gsap.to(phoneRef.current, {
          y: -8,
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section
      id="inbox"
      ref={sectionRef}
      className="main-wrapper relative overflow-x-clip px-5 py-20 sm:px-8 md:py-32 lg:px-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-hero-mesh" aria-hidden="true" />
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-accent-purple/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-accent-yellow/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <FadeIn>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-yellow/30 bg-accent-yellow/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent-yellow">
            <MessageCircle className="h-4 w-4" />
            Mạng xã hội đọc sách
          </div>
          <h2
            className="mb-6 font-black uppercase tracking-tighter text-text-primary"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
          >
            Nhắn tin &{' '}
            <span className="text-gold-gradient">trao đổi sách</span>
          </h2>
          <p className="mb-8 max-w-lg text-lg leading-relaxed text-text-muted">
            Tìm người đọc cùng gu, gửi tin nhắn riêng tư, thảo luận nội dung sách và hẹn gặp trao đổi — giống
            mạng xã hội nhưng dành cho tri thức.
          </p>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Users, label: 'Kết nối độc giả', color: 'text-accent-teal' },
              { icon: MessageCircle, label: 'Inbox riêng tư', color: 'text-accent-rose' },
              { icon: Sparkles, label: 'Trao đổi văn minh', color: 'text-accent-yellow' },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="inbox-float glass-card flex flex-col items-center gap-2 p-4 text-center transition-all duration-500 ease-awwwards hover:border-white/15"
              >
                <Icon className={`h-6 w-6 ${color}`} />
                <span className="text-xs font-medium text-text-primary">{label}</span>
              </div>
            ))}
          </div>

          <Magnetic strength={5}>
            <GradientButton
              onClick={() => {
                window.location.href = user ? '/app/messages' : '/register'
              }}
            >
              {user ? 'Mở hộp thư' : 'Đăng ký & nhắn tin'}
            </GradientButton>
          </Magnetic>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div ref={phoneRef} className="inbox-float relative mx-auto max-w-sm">
            <div className="glass-card overflow-hidden shadow-2xl shadow-accent-purple/10">
              <div className="flex items-center justify-between border-b border-white/5 bg-[#141414]/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-accent-yellow" />
                  <span className="font-bold text-text-primary">Tin nhắn</span>
                </div>
                <span className="rounded-full bg-accent-rose/20 px-2 py-0.5 text-xs font-bold text-accent-rose">
                  3 mới
                </span>
              </div>

              <div className="max-h-[320px] overflow-y-auto">
                {DEMO_CHATS.map((chat) => (
                  <div
                    key={chat.name}
                    className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-yellow/30 to-accent-purple/30 text-xl">
                      {chat.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold text-text-primary">{chat.name}</span>
                        <span className="shrink-0 text-[10px] text-text-muted">{chat.time}</span>
                      </div>
                      <p className="truncate text-xs text-accent-yellow/80">{chat.book}</p>
                      <p className="truncate text-sm text-text-muted">{chat.preview}</p>
                    </div>
                    {chat.unread > 0 && (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-yellow text-[10px] font-bold text-dark">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 p-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <input
                    readOnly
                    placeholder="Nhắn về quyển sách..."
                    className="flex-1 bg-transparent text-sm text-text-muted outline-none"
                  />
                  <Send className="h-4 w-4 text-accent-yellow" />
                </div>
              </div>
            </div>

            <img
              src={ILLUSTRATIONS.community}
              alt="Cộng đồng đọc sách"
              className="absolute -bottom-8 -right-8 hidden h-28 w-28 rounded-2xl border-2 border-white/10 object-cover shadow-xl sm:block"
              loading="lazy"
            />
          </div>

          {!user && (
            <p className="mt-6 text-center text-sm text-text-muted">
              <Link to="/login" className="text-accent-yellow hover:underline">
                Đăng nhập
              </Link>{' '}
              để bắt đầu trò chuyện thật
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  )
}
