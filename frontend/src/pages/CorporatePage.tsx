import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

// Intersection Observer Hook for Scroll Animations
const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    }, { threshold: 0.1, ...options })
    
    const currentElement = elementRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])
  
  return [elementRef, isVisible] as const
}

// Animated Stats Counter Component
const StatCounter = ({ end, suffix = '', prefix = '', label }: { end: number; suffix?: string; prefix?: string; label: string }) => {
  const [count, setCount] = useState(0)
  const [ref, isVisible] = useIntersectionObserver()
  const [hasAnimated, setHasAnimated] = useState(false)
  
  useEffect(() => {
    if (isVisible && !hasAnimated) {
      setHasAnimated(true)
      const duration = 2000
      const steps = 50
      const increment = end / steps
      const stepDuration = duration / steps
      let current = 0
      
      const timer = setInterval(() => {
        current += increment
        if (current >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, stepDuration)
      
      return () => clearInterval(timer)
    }
  }, [isVisible, hasAnimated, end])
  
  return (
    <div ref={ref} className="text-center transform transition-all duration-700" style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
    }}>
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 text-sm md:text-base">{label}</div>
    </div>
  )
}

// Animated Card Component
const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const [ref, isVisible] = useIntersectionObserver()
  
  return (
    <div 
      ref={ref} 
      className="transform transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

// Floating Animation Component
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <div 
      className="animate-float"
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

// Particle Background Effect
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  )
}

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const slides = [
    {
      id: 1,
      title: 'Labuan Financial Services Authority',
      subtitle: 'The regulatory body for Labuan International Business and Financial Centre',
      description: 'Leading the way in international business and financial regulation since 1990',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
      cta: { text: 'Explore Services', link: '#services' },
      gradient: 'from-blue-900/90 via-blue-800/85 to-transparent'
    },
    {
      id: 2,
      title: 'Global Financial Centres Index Recognition',
      subtitle: 'Labuan IBFC debuts at 60th place among 120 financial centres worldwide',
      highlights: [
        'Top 16 Centres projected to grow in significance',
        'Top 15 Centres with High Reputational Advantage',
        'Recognised as "Relatively Deep" International Specialist centre'
      ],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80',
      cta: { text: 'Read More', link: '#news' },
      gradient: 'from-indigo-900/90 via-indigo-800/85 to-transparent'
    },
    {
      id: 3,
      title: 'Carbon Credit Trading Solutions',
      subtitle: 'Tailored financial solutions for carbon-related activities',
      highlights: [
        'Carbon Credit Trading via International Trading Companies',
        'Project Financing using fund structures and PCCs',
        'Risk Management through captive and reinsurance',
        'Digital Innovation with blockchain tokenisation'
      ],
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=80',
      cta: { text: 'Learn More', link: '#carbon-credits' },
      gradient: 'from-green-900/90 via-green-800/85 to-transparent'
    },
    {
      id: 4,
      title: 'Budget 2025: Islamic Finance Expansion',
      subtitle: 'Enhanced tax exemption for Islamic financial activities in Labuan IBFC',
      description: 'The tax exemption has been expanded to include the (re)Takaful sector, effective from Year of Assessment 2025 to 2028. This incentive fuels growth and reinforces Labuan\'s position as the premier hub for Islamic finance.',
      image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1920&q=80',
      cta: { text: 'View Details', link: '#budget-2025' },
      gradient: 'from-purple-900/90 via-purple-800/85 to-transparent'
    }
  ]

  useEffect(() => {
    if (!isPaused && isAutoPlaying) {
      const timer = setInterval(() => {
        setDirection('right')
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 6000)
      return () => clearInterval(timer)
    }
  }, [isPaused, isAutoPlaying, slides.length])

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 'right' : 'left')
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }

  const nextSlide = () => {
    setDirection('right')
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setDirection('left')
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div 
      className="relative overflow-hidden bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0 z-10' 
                : index < currentSlide 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image with Ken Burns Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className={`w-full h-full transition-transform duration-[8000ms] ease-out ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
              >
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className={`max-w-3xl transition-all duration-1000 delay-300 ${
                  index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                  {/* Slide Number Indicator */}
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {slides.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-0.5 transition-all duration-300 ${
                            idx === currentSlide 
                              ? 'w-8 bg-white' 
                              : idx < currentSlide 
                                ? 'w-4 bg-white/50' 
                                : 'w-4 bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white/70 text-sm font-medium">
                      {String(currentSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-6">
                    {slide.subtitle}
                  </p>
                  
                  {slide.description && (
                    <p className="text-base sm:text-lg text-blue-50/90 mb-6 leading-relaxed max-w-2xl">
                      {slide.description}
                    </p>
                  )}
                  
                  {slide.highlights && (
                    <ul className="space-y-3 mb-8">
                      {slide.highlights.map((highlight, idx) => (
                        <li 
                          key={idx} 
                          className={`flex items-start gap-3 transition-all duration-500 ${
                            index === currentSlide 
                              ? 'opacity-100 translate-x-0' 
                              : 'opacity-0 -translate-x-4'
                          }`}
                          style={{ transitionDelay: `${(idx + 1) * 150 + 400}ms` }}
                        >
                          <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm sm:text-base lg:text-lg text-blue-50">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {slide.cta && (
                    <div className="flex flex-wrap gap-4">
                      <a
                        href={slide.cta.link}
                        className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                      >
                        {slide.cta.text}
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </a>
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/20 transition-all"
                      >
                        {isAutoPlaying ? (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pause
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Play
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 border border-white/20"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 border border-white/20"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Thumbnail Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden lg:flex gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
              index === currentSlide
                ? 'w-32 h-20 ring-4 ring-white shadow-2xl'
                : 'w-20 h-12 ring-2 ring-white/30 hover:ring-white/60 opacity-70 hover:opacity-100'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            <img 
              src={slide.image} 
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute bottom-1 left-1 right-1 text-[10px] text-white font-medium truncate px-1">
              {slide.title.split(' ').slice(0, 3).join(' ')}
            </div>
          </button>
        ))}
      </div>

      {/* Progress Dots (Mobile) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 lg:hidden">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative overflow-hidden rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-10 h-3 bg-white shadow-lg'
                : 'w-3 h-3 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <div 
                className="absolute inset-0 bg-white/40"
                style={{
                  animation: isAutoPlaying && !isPaused ? 'progress 6s linear' : 'none'
                }}
              ></div>
            )}
          </button>
        ))}
      </div>

      {/* Autoplay indicator */}
      {isAutoPlaying && !isPaused && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 bg-black/30 backdrop-blur-sm rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">Auto-playing</span>
        </div>
      )}
    </div>
  )
}

// Reusable news card: renders an image if provided, otherwise a corporate placeholder
const NewsCard = (
  {
    image,
    badge,
    date,
    readTime,
    title,
    excerpt,
    link = '#news-detail',
  }: {
    image?: string
    badge: string
    date: string
    readTime?: string
    title: string
    excerpt: string
    link?: string
  }
): JSX.Element => {
  const hasImage = Boolean(image)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article 
      className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasImage ? (
        <div className="relative h-40 sm:h-44 lg:h-36 w-full overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className={`object-cover w-full h-full transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute top-3 left-3 bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded shadow-lg">{badge}</span>
        </div>
      ) : (
        <div className="relative h-40 sm:h-44 lg:h-36 w-full bg-gradient-to-tr from-slate-900 via-slate-700 to-slate-600 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-xs uppercase tracking-wide text-slate-200">{badge}</div>
            <div className="mt-3 text-white text-lg font-semibold leading-tight">
              {title.split(' ').slice(0, 7).join(' ')}
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <time className="text-xs text-slate-500">{date}</time>
          {readTime && <span className="text-xs text-slate-500">{readTime}</span>}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">{title}</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{excerpt}</p>
        <div className="flex items-center gap-3">
          <a href={link} className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all hover:scale-105">
            Read article
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
          <button className="p-2 text-slate-600 hover:text-blue-600 transition-colors" title="Share">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

// Scroll Progress Indicator
const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = window.scrollY
      const progress = (scrolled / scrollHeight) * 100
      setScrollProgress(progress)
    }
    
    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

// Back to Top Button
const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500)
    }
    
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  )
}

export function CorporatePage() {
  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Header />
      <main className="pt-0 lg:pt-32">
        {/* Hero Banner with Carousel */}
        <HeroCarousel />

        {/* Modern Interactive Section After Carousel */}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              <AnimatedCard delay={0}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Regulatory Framework</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Comprehensive regulatory framework ensuring robust financial oversight and compliance standards.</p>
                    <a href="#regulations" className="inline-flex items-center text-blue-600 font-semibold hover:gap-2 transition-all group">
                      Learn More
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={100}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Business Solutions</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Diverse range of financial services and business structures tailored for international operations.</p>
                    <a href="#services" className="inline-flex items-center text-indigo-600 font-semibold hover:gap-2 transition-all group">
                      Explore Services
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={200}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Global Recognition</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">Recognized internationally for excellence in financial regulation and Islamic finance leadership.</p>
                    <a href="#recognition" className="inline-flex items-center text-purple-600 font-semibold hover:gap-2 transition-all group">
                      View Achievements
                      <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Latest News Section */}
          <section id="news" className="scroll-mt-20">
            <div className="mb-6 sm:mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Latest News</h2>
                <p className="text-sm sm:text-base text-slate-600">Curated announcements, insights and press releases from Labuan FSA</p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <a href="#news-archive" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">View all news →</a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard delay={0}>
                <NewsCard
                image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
                badge="Press Release"
                date="13 Nov 2025"
                readTime="4 min read"
                title="Press Release on Datuk Ahmad Hizzad Baharuddin Appointed as New Chairman"
                excerpt="Datuk Ahmad Hizzad Baharuddin has been appointed as the new Chairman of Labuan FSA, bringing extensive experience in financial regulation."
                link="#news-detail"
              />
              </AnimatedCard>

              <AnimatedCard delay={100}>
                <NewsCard
                image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
                badge="Guidance"
                date="06 Nov 2025"
                readTime="2 min read"
                title="Regulatory Guide on Implementation of Revised Fees Effective 2026"
                excerpt="New regulatory guide published for the implementation of revised fees structure effective from 2026."
                link="#news-detail"
              />
              </AnimatedCard>

              <AnimatedCard delay={200}>
                <NewsCard
                image=""
                badge="Announcements"
                date="10 Oct 2025"
                readTime="3 min read"
                title="Two Conditional Approvals Under I-BOX Guidelines"
                excerpt="Labuan FSA grants conditional approvals for establishment of Labuan Islamic Digital Banks under sandbox requirements."
                link="#news-detail"
              />
              </AnimatedCard>
            </div>

            <div className="mt-6 text-center sm:hidden">
              <a href="#news-archive" className="text-sm font-medium text-slate-700 hover:text-slate-900">View all news</a>
            </div>
          </section>

          {/* Modern Investor Alerts Section */}
          <section id="investor-alerts" className="scroll-mt-20">
            <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 lg:p-10 overflow-hidden border border-amber-200 shadow-xl">
              {/* Animated Backgrounds */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
              
              {/* Modern Header */}
              <div className="mb-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl sm:text-4xl font-black mb-2">
                      <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                        Investor Alerts
                      </span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        3 Active Alerts
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                        Last Updated: Today
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-300/50 shadow-md">
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Important:</strong> Critical notifications and enforcement actions for investor protection. Please review these alerts carefully.</span>
                  </p>
                </div>
              </div>
              
              {/* Modern Alert Cards */}
              <div className="space-y-4 relative z-10">
                <AnimatedCard delay={0}>
                <div className="group relative bg-white border-2 border-red-200 rounded-xl p-6 hover:border-red-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* Priority Indicator */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors">Enforcement Actions on Labuan Licensed Entities</h3>
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">HIGH PRIORITY</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap bg-gray-100 px-3 py-1 rounded-full">23 October 2025</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed pl-15">Enforcement actions taken by Labuan Financial Services Authority on Labuan Licensed Entities for regulatory compliance violations.</p>
                    <div className="flex items-center justify-between pl-15">
                      <a href="#alert-detail" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all group/btn">
                        View Details
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <span className="text-xs text-gray-500">Read time: 2 min</span>
                    </div>
                  </div>
                </div>
                </AnimatedCard>

                <AnimatedCard delay={100}>
                <div className="group relative bg-white border-2 border-amber-200 rounded-xl p-6 hover:border-amber-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-amber-500 to-yellow-500"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">Business Restriction on Labuan Licensed Entities</h3>
                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">MEDIUM PRIORITY</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap bg-gray-100 px-3 py-1 rounded-full">30 September 2025</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed pl-15">Business restriction notices issued to specific Labuan Licensed Entities for regulatory compliance review.</p>
                    <div className="flex items-center justify-between pl-15">
                      <a href="#alert-detail" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-sm font-bold rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all group/btn">
                        View Details
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <span className="text-xs text-gray-500">Read time: 3 min</span>
                    </div>
                  </div>
                </div>
                </AnimatedCard>

                <AnimatedCard delay={200}>
                <div className="group relative bg-white border-2 border-orange-200 rounded-xl p-6 hover:border-orange-400 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-500 to-red-500"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">List of Unregulated / Unauthorised Entities</h3>
                            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">UPDATED LIST</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap bg-gray-100 px-3 py-1 rounded-full">08 August 2025</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed pl-15">Updated list of unregulated or unauthorised individuals, entities, websites, and funds not licensed by Labuan FSA.</p>
                    <div className="flex items-center justify-between pl-15">
                      <a href="#alert-detail" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-sm font-bold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all group/btn">
                        View List
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <span className="text-xs text-gray-500">45 Entities Listed</span>
                    </div>
                  </div>
                </div>
                </AnimatedCard>
              </div>
            </div>
          </section>

          {/* AML/CFT Compliance Highlight */}
          <section id="aml" className="scroll-mt-20">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
              
              <div className="text-center mb-8 sm:mb-10 relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Anti-Money Laundering & CFT Compliance</h2>
                <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">Ensuring robust compliance frameworks for financial integrity</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <AnimatedCard delay={0}>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border-2 border-transparent hover:border-blue-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Guidelines on Beneficial Ownership</h3>
                        <p className="text-gray-600 text-sm mb-3">New guidelines for beneficial ownership requirements for Labuan entities to enhance transparency.</p>
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded animate-pulse-glow">NEW</span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard delay={200}>
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border-2 border-transparent hover:border-indigo-500">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Guidelines on Travel Rule</h3>
                        <p className="text-gray-600 text-sm mb-3">Travel rule implementation for Labuan Digital Financial Services to combat illicit finance.</p>
                        <a href="#aml-guidelines" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm inline-flex items-center">
                          View Guidelines
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </section>
          
          {/* Modern Key Highlights Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sustainability Card */}
            <AnimatedCard delay={0}>
              <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src="https://www.labuanfsa.gov.my/clients/asset_120A5FB8-61B6-45E8-93F0-3F79F86455C8/contentms/img/Images/Golf%20Club(Resize).jpg" 
                    alt="Sustainability" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sustainability
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-green-600 transition-colors">Labuan IBFC Sustainability Taxonomy</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">LiST guides financial institutions to identify, assess, and classify business activities in accordance with sustainability objectives.</p>
                  <a href="#sustainability" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-bold group/btn">
                    Learn More
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
              </div>
            </AnimatedCard>

            {/* Speak Up Channel Card */}
            <AnimatedCard delay={100}>
              <div className="group relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-20 -mb-20 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full mb-4">CONFIDENTIAL SERVICE</span>
                  <h3 className="text-2xl font-black mb-3">Speak Up Channel</h3>
                  <p className="text-blue-100 mb-6 leading-relaxed">Independent whistleblowing service managed by Deloitte. All reports are completely confidential and secure.</p>
                </div>
                <a href="https://secure.deloitte-halo.com/labuanfsawhistleblowing" target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all hover:gap-3 shadow-xl">
                  Lodge a Report
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </AnimatedCard>

            {/* Carbon Credit Trading Card */}
            <AnimatedCard delay={200}>
              <div className="group relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-2xl shadow-xl overflow-hidden text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 p-8 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full -ml-20 -mb-20 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full mb-4">ESG INITIATIVE</span>
                  <h3 className="text-2xl font-black mb-3">Carbon Credit Trading</h3>
                  <p className="text-green-100 mb-6 leading-relaxed">Tailored financial solutions for carbon-related activities including trading, financing, and risk management.</p>
                </div>
                <a href="#carbon-credits" className="relative z-10 inline-flex items-center gap-2 text-white font-bold hover:gap-3 transition-all group/btn">
                  <span className="px-6 py-4 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center gap-2">
                    View Guidelines
                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
              </div>
            </AnimatedCard>
          </section>

          {/* Statistics Section */}
          <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 rounded-xl lg:rounded-2xl p-8 sm:p-10 lg:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="relative">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 rounded-full mb-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">35 Years of Excellence</h2>
                <p className="text-base sm:text-lg text-blue-200 max-w-3xl mx-auto">
                  Leading the way in international business and financial regulation since 1990
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <StatCounter end={1200} suffix="+" label="Licensed Entities" />
                <StatCounter end={35} suffix=" Years" label="Experience" />
                <StatCounter end={95} suffix="%" label="Client Satisfaction" />
                <StatCounter end={60} suffix="th" label="Global Ranking" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/e-submission" className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-all hover:scale-105">
                  Access E-Submission System
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="#about" className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-900 transition-all">
                  Learn More About Us
                </a>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="scroll-mt-20 relative">
            <ParticleBackground />
            <div className="text-center mb-12 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Our Services</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Comprehensive regulatory solutions for international business and finance</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              <AnimatedCard delay={0}>
              <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-blue-500">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Banking Services</h3>
                <p className="text-gray-600 text-sm">Comprehensive banking licenses and regulatory framework</p>
              </div>
              </AnimatedCard>
              
              <AnimatedCard delay={100}>
              <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-green-500">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Insurance</h3>
                <p className="text-gray-600 text-sm">Insurance and takaful business operations and licensing</p>
              </div>
              </AnimatedCard>
              
              <AnimatedCard delay={200}>
              <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-purple-500">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Fund Management</h3>
                <p className="text-gray-600 text-sm">Investment funds and asset management solutions</p>
              </div>
              </AnimatedCard>
              
              <AnimatedCard delay={300}>
              <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-orange-500">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Trading</h3>
                <p className="text-gray-600 text-sm">International trading companies and commodities</p>
              </div>
              </AnimatedCard>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Labuan FSA</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Positioned as a leading international business and financial centre</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Robust Regulation</h3>
                <p className="text-gray-600">Comprehensive regulatory framework aligned with international standards</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Strategic Location</h3>
                <p className="text-gray-600">Gateway to Asia-Pacific region with excellent connectivity</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Tax Efficiency</h3>
                <p className="text-gray-600">Competitive tax framework and attractive incentives</p>
              </div>
            </div>
          </section>

          {/* Awards Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">HR Award 2024</h3>
              <p className="text-gray-600 text-sm">Gold Award - Employer of Choice (Public Sector) by MIHRM</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Global Islamic Finance Awards</h3>
              <p className="text-gray-600 text-sm">Best International Jurisdiction for Islamic Banking and Finance 2024</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">BrandLaureate 2022</h3>
              <p className="text-gray-600 text-sm">Brand of the Year - FinTech Islamic Financial Services</p>
            </div>
          </section>

          {/* Key Partners Section */}
          <section className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Key Partners</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Collaborating with leading organizations globally</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
              <div className="flex items-center justify-center h-20">
                <div className="text-center text-gray-400 font-bold text-xl">Bank Negara Malaysia</div>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center text-gray-400 font-bold text-xl">ASEAN</div>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center text-gray-400 font-bold text-xl">IMF</div>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center text-gray-400 font-bold text-xl">World Bank</div>
              </div>
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl lg:rounded-2xl p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Upcoming Events</h2>
              <p className="text-base sm:text-lg text-gray-600">Join us at our upcoming events and conferences</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-green-600">22 Nov 2025</div>
                    <div className="text-gray-500">Labuan</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">Mangrove Planting Initiative</h3>
                <p className="text-sm text-gray-600">ALAM BE-LEAF Labuan Chapter at Taman Ekologi Kinebenuwa</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-blue-600">24-27 Nov 2025</div>
                    <div className="text-gray-500">LIS Auditorium</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">Labuan International Compliance Conference</h3>
                <p className="text-sm text-gray-600">Annual compliance conference at Labuan International School</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-indigo-600">28 Nov 2025</div>
                    <div className="text-gray-500">Lazenda Hotel</div>
                  </div>
                </div>
                <h3 className="font-bold mb-2">Finance Lecture Series 2025</h3>
                <p className="text-sm text-gray-600">Labuan International Finance Lecture Series at Lazenda Hotel, Labuan</p>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to Get Started?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access our E-Submission System to submit your applications online or contact our team for assistance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                to="/e-submission" 
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
              >
                Access E-Submission
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a 
                href="#contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all"
              >
                Contact Us
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
