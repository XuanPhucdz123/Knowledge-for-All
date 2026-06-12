import clsx from 'clsx'
import { useEffect, useState, type ImgHTMLAttributes } from 'react'

interface ImageWithSkeletonProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  fallbackSrc?: string
  wrapperClassName?: string
  skeletonClassName?: string
}

export function ImageWithSkeleton({
  src,
  fallbackSrc,
  wrapperClassName,
  skeletonClassName,
  className,
  onLoad,
  onError,
  ...props
}: ImageWithSkeletonProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setCurrentSrc(src)
    setLoaded(false)
  }, [src])

  return (
    <span className={clsx('relative block overflow-hidden', wrapperClassName)}>
      {!loaded && (
        <span
          className={clsx('absolute inset-0 animate-pulse bg-white/5', skeletonClassName)}
          aria-hidden="true"
        />
      )}
      <img
        {...props}
        src={currentSrc}
        onLoad={(event) => {
          setLoaded(true)
          onLoad?.(event)
        }}
        onError={(event) => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc)
            setLoaded(false)
            return
          }
          setLoaded(true)
          onError?.(event)
        }}
        className={clsx(
          className,
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </span>
  )
}
