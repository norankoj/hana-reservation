"use client";
// 그룹웨어(hana-groupware/src/components/Select.tsx) 드롭다운 디자인을 옮겨 온 것.
// <form> 안에서 그대로 쓰도록 name 으로 값을 보내고, required 면 안 골랐을 때 막아 줌.
import { useState, useRef, useEffect } from "react";

type Option = string | { value: string; label: string };

export default function Select({
  name, options, placeholder = "선택하세요", defaultValue = "", required,
}: {
  name: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [up, setUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

  // 바깥을 누르면 닫기
  useEffect(() => {
    if (!isOpen) return;
    const outside = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setIsOpen(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [isOpen]);

  const toggle = () => {
    // 아래 공간이 모자라면 위로 펼침
    if (!isOpen && ref.current) setUp(window.innerHeight - ref.current.getBoundingClientRect().bottom < 300);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* 폼으로 값 보내기 + 필수 검사용 (눈에 안 보임) */}
      <input
        name={name} value={value} required={required} onChange={() => {}} tabIndex={-1} aria-hidden
        className="absolute inset-0 opacity-0 pointer-events-none"
        onInvalid={() => !isOpen && toggle()}
      />
      <button
        type="button"
        onClick={toggle}
        className={`w-full flex items-center justify-between text-left p-3 bg-white border-2 rounded-xl transition-all duration-200 outline-none ${
          isOpen ? "ring-2 ring-brand/20 border-brand" : "border-gray-200"
        }`}
      >
        <span className={`truncate font-bold text-base ${value ? "text-gray-900" : "text-gray-400"}`}>
          {opts.find((o) => o.value === value)?.label || placeholder}
        </span>
        <svg className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className={`bg-white border border-gray-100 rounded-xl shadow-lg max-h-[18rem] overflow-y-auto animate-fade-in absolute inset-x-0 z-20 ${up ? "bottom-full mb-1" : "top-full mt-1"}`}>
          {opts.map((o) => (
            <div
              key={o.value}
              onClick={() => {
                setValue(o.value);
                setIsOpen(false);
              }}
              className={`px-4 py-3 text-base cursor-pointer transition-colors ${
                value === o.value ? "bg-brand-soft text-brand font-bold" : "text-gray-700 hover:bg-gray-50 hover:text-brand"
              }`}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
