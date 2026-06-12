export default function CairoSkyline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 760 180"
      preserveAspectRatio="xMinYMax meet"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <path d="M0 162H760V180H0z" fill="currentColor" opacity=".13" />
      <path d="M18 162 92 86l62 76Zm58 0 78-58 68 58Z" fill="none" stroke="currentColor" strokeWidth="3" opacity=".58" />
      <path d="m94 162 58-56m-32 56 34-32m-82 32 42-43" stroke="currentColor" strokeWidth="2" opacity=".18" />
      <path d="M206 162v-54h26v54m-18-54V74h10v34m-5-34V51m-5 11h10m-16 46h22M256 162v-88h30v88m-20-88V39h10v35m-5-35V16m-6 16h12m-16 42h20M318 162v-62h42v62m-32-62V63h22v37m-11-37V40m-6 9h12m-26 51h40M396 162v-78h32v78m-20-78V53h10v31m-5-31V27m-6 12h12m-18 45h22M458 162v-52h52v52m-40-52V88h28v22m-14-22V66m-8 11h16m-30 33h44M545 162v-70h36v70m-22-70V58h10v34m-5-34V34m-6 12h12m-20 46h26M616 162v-48h62v48m-46-48V88h30v26m-15-26V67m-8 10h16m-34 37h52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" opacity=".48" />
      <path d="M198 162h496M233 162h28m30 0h23m53 0h26m39 0h22m60 0h28m39 0h31" stroke="currentColor" strokeWidth="4" opacity=".24" />
      <path d="M239 162v-22h17v22m39 0v-20h16v20m62 0v-22h15v22m49 0v-18h15v18m48 0v-21h17v21m74 0v-18h14v18m48 0v-19h16v19" fill="none" stroke="currentColor" strokeWidth="2" opacity=".22" />
    </svg>
  );
}
