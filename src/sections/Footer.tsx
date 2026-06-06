import { BookOpen, MessageCircle, Sparkles, Users } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatedText } from '../components/AnimatedText'
import { Magnetic } from '../components/Magnetic'
import { APP_NAME } from '../lib/constants'
import { useReducedMotion } from '../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

const TEAM = [
  { name: 'Nguyễn Xuân Phúc', role: 'Trưởng nhóm', variant: 'gold' as const },
  { name: 'Nguyễn Thanh Trạng', role: 'Phó nhóm', variant: 'silver' as const },
  { name: 'Dư Ngọc Ái Vy', role: 'Thành viên', variant: 'silver' as const },
]

const INBOX_STEPS = [
  {
    icon: Users,
    title: 'Tìm người đọc cùng gu',
    desc: 'Khám phá sách quanh bạn, gửi lời mời kết nối — mỗi cuốn sách là một câu chuyện chờ được kể.',
  },
  {
    icon: MessageCircle,
    title: 'Inbox riêng tư, an toàn',
    desc: 'Trao đổi trực tiếp trong hộp thư nội bộ: thảo luận nội dung, hẹn gặp, thống nhất hình thức chia sẻ.',
  },
  {
    icon: Sparkles,
    title: 'Kết bạn qua tri thức',
    desc: 'Không chỉ trao sách — bạn xây dựng mạng lưới đọc sách địa phương, nơi mỗi tin nhắn mở ra một kết nối mới.',
  },
]

const LUXURY_EASE = 'cubic-bezier(0.25, 1, 0.5, 1)'

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const diamondRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)
  const facetRefs = useRef<HTMLSpanElement[]>([])
  const teacherNameRef = useRef<HTMLParagraphElement>(null)
  const inboxRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !footerRef.current) return

    const ctx = gsap.context(() => {
      // Gradient title — GSAP shifts background-position for living color flow
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          backgroundPosition: '200% center',
          duration: 6,
          ease: 'none',
          repeat: -1,
        })
      }

      // Diamond shine sweep across teacher card
      if (shineRef.current) {
        gsap.fromTo(
          shineRef.current,
          { xPercent: -120, opacity: 0 },
          {
            xPercent: 220,
            opacity: 1,
            duration: 2.2,
            ease: 'power2.inOut',
            repeat: -1,
            repeatDelay: 2.8,
          },
        )
      }

      // Diamond facet pulses — staggered sparkle on corners
      facetRefs.current.forEach((facet, i) => {
        if (!facet) return
        gsap.to(facet, {
          opacity: 0.9,
          scale: 1.15,
          duration: 1.4 + i * 0.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.35,
        })
      })

      // Teacher name — cycling gold ↔ silver gradient
      if (teacherNameRef.current) {
        gsap.to(teacherNameRef.current, {
          backgroundPosition: '100% 50%',
          duration: 4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }

      // Cinematic inbox section — scroll-triggered stagger
      if (inboxRef.current) {
        const cards = inboxRef.current.querySelectorAll('.inbox-card')
        const heading = inboxRef.current.querySelector('.inbox-heading')
        const tagline = inboxRef.current.querySelector('.inbox-tagline')

        gsap.set([heading, tagline, ...cards], { opacity: 0, y: 48 })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: inboxRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })

        tl.to(heading, { opacity: 1, y: 0, duration: 1, ease: LUXURY_EASE })
          .to(tagline, { opacity: 1, y: 0, duration: 0.9, ease: LUXURY_EASE }, '-=0.5')
          .to(
            cards,
            {
              opacity: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.18,
              ease: LUXURY_EASE,
            },
            '-=0.4',
          )
      }

      // Subtle float on diamond container
      if (diamondRef.current) {
        gsap.to(diamondRef.current, {
          y: -6,
          duration: 3.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
      }
    }, footerRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <footer
      ref={footerRef}
      className="main-wrapper relative overflow-x-clip border-t border-white/5 bg-[#0C0C0C] px-5 py-20 sm:px-8 lg:px-16 lg:py-28"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,215,77,0.45), rgba(192,192,192,0.35), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Brand row */}
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Magnetic strength={5} padding={60}>
            <Link
              to="/"
              className="group flex items-center gap-3 transition-all duration-500 ease-awwwards"
            >
              <BookOpen className="h-7 w-7 text-[#FFD84D] transition-transform duration-500 ease-awwwards group-hover:scale-110" />
              <span className="text-lg font-black uppercase tracking-tighter text-[#F7F2E8]">
                {APP_NAME}
              </span>
            </Link>
          </Magnetic>

          <AnimatedText
            text="Nền tảng chia sẻ sách quanh bạn — dữ liệu thật từ cộng đồng, kết nối tri thức không biên giới."
            scrollReveal
            className="max-w-xl text-sm leading-relaxed text-[#A8A29E] md:text-base"
          />
        </div>

        {/* Hero title */}
        <div className="mb-20 text-center">
          <h2
            ref={titleRef}
            className="mb-3 font-black uppercase leading-[0.92] tracking-tighter text-[clamp(2.5rem,8vw,7rem)]"
            style={{
              background:
                'linear-gradient(90deg, #FFF7CC 0%, #FFD84D 25%, #FFFFFF 50%, #C0C0C0 75%, #B7791F 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Tri thức không biên giới
          </h2>
          <p className="text-silver-gradient text-[clamp(1rem,2.5vw,1.5rem)] font-medium tracking-wide">
            Knowledge for All
          </p>
        </div>

        {/* Team (left) + Teacher diamond (right) */}
        <div className="mb-24 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-[#A8A29E]">
              Đội ngũ phát triển
            </p>
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="glass-panel group rounded-2xl px-6 py-5 transition-all duration-500 ease-awwwards hover:border-white/12 hover:bg-[#141414]/90"
                style={{
                  background: 'rgba(20, 20, 20, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p
                  className={
                    member.variant === 'gold'
                      ? 'text-gold-gradient text-xl font-black tracking-tight md:text-2xl'
                      : 'text-silver-gradient text-lg font-semibold md:text-xl'
                  }
                >
                  {member.name}
                </p>
                <p className="mt-1 text-sm text-[#A8A29E] transition-colors duration-500 ease-awwwards group-hover:text-[#C0C0C0]">
                  {member.role}
                </p>
              </div>
            ))}
          </div>

          {/* Teacher — separated right, diamond shine */}
          <div className="flex items-center justify-center lg:justify-end">
            <div ref={diamondRef} className="relative w-full max-w-md">
              {/* Diamond facet sparkles */}
              {(['top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'] as const).map(
                (pos, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      if (el) facetRefs.current[i] = el
                    }}
                    className={`pointer-events-none absolute ${pos} z-20 block h-3 w-3 rotate-45 bg-gradient-to-br from-[#FFF7CC] via-[#FFD84D] to-transparent opacity-40`}
                    aria-hidden="true"
                  />
                ),
              )}

              {/* Rotated diamond frame */}
              <div
                className="pointer-events-none absolute inset-4 rotate-45 rounded-3xl border border-[#FFD84D]/20"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,247,204,0.06) 0%, transparent 50%, rgba(192,192,192,0.04) 100%)',
                }}
                aria-hidden="true"
              />

              <div
                className="relative overflow-hidden rounded-3xl px-8 py-10 text-center transition-all duration-500 ease-awwwards hover:border-[#FFD84D]/25"
                style={{
                  background: 'rgba(20, 20, 20, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* GSAP shine sweep */}
                <div
                  ref={shineRef}
                  className="pointer-events-none absolute inset-y-0 w-1/2 opacity-0"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 0%, rgba(255,247,204,0.15) 45%, rgba(255,255,255,0.35) 50%, rgba(255,247,204,0.15) 55%, transparent 100%)',
                  }}
                  aria-hidden="true"
                />

                <p className="relative z-10 mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#C0C0C0]">
                  Giáo viên hướng dẫn
                </p>
                <p
                  ref={teacherNameRef}
                  className="relative z-10 text-[clamp(1.25rem,3vw,1.75rem)] font-black leading-tight tracking-tight"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFF7CC 0%, #FFD84D 30%, #FFFFFF 50%, #C0C0C0 70%, #B7791F 100%)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Cô Phạm Nguyễn Cẩm Tú
                </p>
                <p className="relative z-10 mt-4 text-sm leading-relaxed text-[#A8A29E]">
                  Người thắp sáng hành trình tri thức của chúng em
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cinematic inbox / friend section */}
        <div
          ref={inboxRef}
          className="relative mb-20 overflow-hidden rounded-[2rem] px-6 py-14 sm:px-10 sm:py-16 lg:px-14"
          style={{
            background: 'rgba(20, 20, 20, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,215,77,0.12), transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mb-12 text-center">
            <h3 className="inbox-heading mb-4 font-black uppercase tracking-tighter text-[#F7F2E8] text-[clamp(1.75rem,5vw,3.5rem)]">
              Kết bạn &{' '}
              <span className="text-gold-gradient">Inbox</span>
            </h3>
            <p className="inbox-tagline mx-auto max-w-2xl text-base leading-relaxed text-[#A8A29E] md:text-lg">
              Mỗi cuốn sách là lời chào đầu tiên. Gửi tin nhắn, trò chuyện, hẹn gặp — biến việc đọc thành
              một trải nghiệm kết nối đầy cảm hứng.
            </p>
          </div>

          <div className="relative z-10 grid gap-6 md:grid-cols-3">
            {INBOX_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <article
                  key={step.title}
                  className="inbox-card group rounded-2xl border border-white/5 bg-[#0C0C0C]/60 p-6 transition-all duration-500 ease-awwwards hover:border-white/10 hover:bg-[#141414]/80"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-white/5 bg-white/5 p-3 transition-all duration-500 ease-awwwards group-hover:border-[#FFD84D]/20 group-hover:bg-[#FFD84D]/5">
                    <Icon className="h-5 w-5 text-[#FFD84D]" />
                  </div>
                  <h4 className="mb-2 font-bold text-[#F7F2E8]">{step.title}</h4>
                  <p className="text-sm leading-relaxed text-[#A8A29E]">{step.desc}</p>
                </article>
              )
            })}
          </div>
        </div>

        <p className="text-center text-xs text-[#A8A29E] md:text-left">
          © {new Date().getFullYear()} {APP_NAME}. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </footer>
  )
}
