"use client";
import Image from "next/image";
import {useState} from "react";
import {Building2,UsersRound,BookOpen} from "lucide-react";

const photos = {
  campus: {
    src: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a",
    alt: "University campus buildings and surrounding grounds",
    icon: Building2
  },
  collaboration: {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    alt: "University students collaborating around a table",
    icon: UsersRound
  },
  library: {
    src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8",
    alt: "Books arranged on a library study table",
    icon: BookOpen
  }
} as const;

/** Editorial images are illustrations of campus life, not staff portraits or product screenshots. */
export function CampusPhoto({kind,className="relative",sizes="(max-width: 768px) 100vw, 50vw",priority=false}:{kind:keyof typeof photos,className?:string,sizes?:string,priority?:boolean}){
  const [failed,setFailed]=useState(false);
  const photo=photos[kind];
  const Icon=photo.icon;
  return <div className={`campus-photo overflow-hidden ${className}`}>
    {failed?<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--color-surface-soft)] text-[var(--color-muted)]" role="img" aria-label="Campus image unavailable">
      <Icon size={34} strokeWidth={1.4} aria-hidden="true"/>
    </div>:
      <Image fill src={photo.src} alt={photo.alt} sizes={sizes} priority={priority} quality={75} onError={()=>setFailed(true)} className="object-cover"/>
    }
  </div>;
}
