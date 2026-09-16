"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import {
  Loader2,
  Plus,
  X,
  ImagePlus,
  Save,
  Rocket,
  Info,
} from "lucide-react";
import { CATEGORIES, slugify } from "@/lib/constants";
import CategoryIcon from "@/components/CategoryIcon";

export interface EditableProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  features: string[];
  priceRobux: number;
  version: string;
  studioVersion: string;
  images: string[];
  fileUrl: string | null;
  fileName: string | null;
  gamePassId: string | null;
  status: string;
  featured: boolean;
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-violet-400/60 focus:bg-black/40";
const labelCls = "mb-2 block text-xs font-semibold uppercase tracking-widest text-zinc-500";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

export default function ProductForm({ initial }: { initial?: EditableProduct }) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0].slug);
  const [price, setPrice] = useState(String(initial?.priceRobux ?? 1000));
  const [version, setVersion] = useState(initial?.version ?? "1.0.0");
  const [studioVersion, setStudioVersion] = useState(
    initial?.studioVersion ?? "Roblox Studio 2024.1+",
  );
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [fileName, setFileName] = useState(initial?.fileName ?? "");
  const [gamePassId, setGamePassId] = useState(initial?.gamePassId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [changelogNotes, setChangelogNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const versionChanged = isEdit && version.trim() !== initial?.version;

  const onNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const addFeature = () => {
    const value = featureInput.trim();
    if (!value || features.includes(value) || features.length >= 24) return;
    setFeatures([...features, value]);
    setFeatureInput("");
  };

  const addImageUrl = () => {
    const value = imageUrl.trim();
    if (!value || images.includes(value) || images.length >= 8) return;
    setImages([...images, value]);
    setImageUrl("");
  };

  const onUploadImage = (files: FileList | null) => {
    setUploadError(null);
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (images.length >= 8) return;
      if (file.size > 2_400_000) {
        setUploadError(`"${file.name}" is too large (max 2.4 MB per image).`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => (prev.length >= 8 ? prev : [...prev, reader.result as string]));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const submit = async (publishStatus?: string) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        category,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        features,
        priceRobux: Math.max(0, Math.round(Number(price) || 0)),
        version: version.trim(),
        studioVersion: studioVersion.trim(),
        images,
        fileUrl: fileUrl.trim() || null,
        fileName: fileName.trim() || null,
        gamePassId: gamePassId.trim() || null,
        status: publishStatus ?? status,
        featured,
        changelogNotes: changelogNotes.trim() || undefined,
      };

      const res = await fetch(
        isEdit ? `/api/products/${initial!.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Saving failed. Check the fields and try again.");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      {/* ------------------------- main column ------------------------- */}
      <div className="space-y-6">
        {/* basics */}
        <section className="panel rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold text-white">Basics</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Product Name">
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="Crystal Island Map"
                  maxLength={80}
                />
              </Field>
            </div>
            <Field label="Slug" hint="Used in the URL: /shop/your-slug">
              <input
                className={`${inputCls} font-mono`}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="crystal-island-map"
                maxLength={80}
              />
            </Field>
            <Field label="Category">
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none pr-10 [&>option]:bg-panel`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <CategoryIcon
                  slug={category}
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400"
                />
              </div>
            </Field>
            <Field label="Price (Robux)">
              <input
                className={inputCls}
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1000"
              />
            </Field>
            <Field label="Version" hint="Semantic version, e.g. 1.0.0">
              <input
                className={`${inputCls} font-mono`}
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Compatible Roblox Studio Version">
                <input
                  className={inputCls}
                  value={studioVersion}
                  onChange={(e) => setStudioVersion(e.target.value)}
                  placeholder="Roblox Studio 2024.1+"
                  maxLength={80}
                />
              </Field>
            </div>
          </div>
        </section>

        {/* copy */}
        <section className="panel rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold text-white">Description</h2>
          <div className="mt-5 space-y-5">
            <Field label="Short Description" hint="Shown on cards — one punchy sentence.">
              <input
                className={inputCls}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A complete fantasy island map for Roblox."
                maxLength={220}
              />
            </Field>
            <Field label="Full Description" hint="Separate paragraphs with blank lines.">
              <textarea
                className={`${inputCls} min-h-40 resize-y leading-relaxed`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Everything a buyer should know about this product…"
                maxLength={8000}
              />
            </Field>
            <Field label="Features" hint="Press Enter or + to add. Shown as a checklist.">
              <div className="flex gap-2.5">
                <input
                  className={inputCls}
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  placeholder="Server-authoritative hitboxes"
                  maxLength={140}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-violet-300 transition-colors hover:bg-violet-500/25"
                  aria-label="Add feature"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {features.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-300"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => setFeatures(features.filter((f) => f !== feature))}
                        className="text-zinc-500 transition-colors hover:text-red-400"
                        aria-label="Remove feature"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </section>

        {/* images */}
        <section className="panel rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold text-white">Images</h2>
          <div className="mt-5 space-y-5">
            <div>
              <label className={labelCls}>Upload Images</label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-2.5 rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-9 text-center transition-colors hover:border-violet-400/40 hover:bg-violet-500/5"
              >
                <ImagePlus className="h-6 w-6 text-violet-400" />
                <span className="text-sm font-medium text-zinc-300">
                  Click to upload preview images
                </span>
                <span className="text-xs text-zinc-600">
                  PNG or JPG, max 2.4 MB each, up to 8 images. First image is the cover.
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  onUploadImage(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploadError && <p className="mt-2 text-xs text-red-400">{uploadError}</p>}
            </div>

            <Field label="…or add by URL">
              <div className="flex gap-2.5">
                <input
                  className={`${inputCls} font-mono`}
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/products/my-image.jpg"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-violet-300 transition-colors hover:bg-violet-500/25"
                  aria-label="Add image URL"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </Field>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((src, i) => (
                  <div
                    key={`${src.slice(0, 48)}-${i}`}
                    className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-violet-600/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-zinc-400 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* delivery */}
        <section className="panel rounded-2xl p-6 sm:p-7">
          <h2 className="font-display text-lg font-semibold text-white">Product File & Payment</h2>
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-white/8 bg-black/25 px-4 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
            <p className="text-xs leading-relaxed text-zinc-500">
              Delivery URLs are never exposed publicly. Buyers receive files only
              through the authenticated download endpoint after a verified
              purchase. Without a delivery URL, a licensed delivery manifest is
              generated automatically.
            </p>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Files — Delivery URL" hint="Private Roblox asset / download link.">
              <input
                className={`${inputCls} font-mono`}
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://create.roblox.com/dashboard/creations/…"
                maxLength={2000}
              />
            </Field>
            <Field label="File Name" hint="Shown in the download, e.g. map-v1.rbxm">
              <input
                className={`${inputCls} font-mono`}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="crystal-island-v1.0.0.rbxm"
                maxLength={200}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label="Roblox Game Pass ID (official payment)"
                hint="When set, buyers pay through this game pass on roblox.com and verify here. Leave empty for demo checkout."
              >
                <input
                  className={`${inputCls} font-mono`}
                  value={gamePassId}
                  onChange={(e) => setGamePassId(e.target.value)}
                  placeholder="e.g. 1234567890"
                  maxLength={40}
                />
              </Field>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------- side column ------------------------- */}
      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <section className="panel-strong rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">Publishing</h2>
          <div className="mt-5">
            <label className={labelCls}>Status</label>
            <div className="grid grid-cols-2 gap-2.5">
              {(["draft", "published"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-all ${
                    status === value
                      ? value === "published"
                        ? "border-emerald-400/40 bg-emerald-500/12 text-emerald-300"
                        : "border-zinc-400/40 bg-zinc-500/12 text-zinc-300"
                      : "border-white/10 bg-white/4 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFeatured((v) => !v)}
            className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all ${
              featured
                ? "border-amber-300/40 bg-amber-500/10"
                : "border-white/10 bg-white/4"
            }`}
          >
            <span className="text-sm font-medium text-zinc-300">
              Featured on homepage
            </span>
            <span
              className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
                featured ? "justify-end bg-amber-400/80" : "justify-start bg-zinc-700"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white shadow" />
            </span>
          </button>

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => submit()}
            disabled={saving}
            className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Save Changes" : status === "published" ? "Publish Product" : "Save Product"}
          </button>
        </section>

        {isEdit && (
          <section className="panel rounded-2xl p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <Rocket className="h-4.5 w-4.5 text-violet-400" />
              Publish Update
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Bump the version above and describe what changed. Every owner is
              upgraded automatically — their download always serves the latest
              version.
            </p>
            <div className="mt-4">
              <label className={labelCls}>Changelog Notes {versionChanged ? "" : "(requires new version)"}</label>
              <textarea
                className={`${inputCls} min-h-24 resize-y text-xs leading-relaxed`}
                value={changelogNotes}
                onChange={(e) => setChangelogNotes(e.target.value)}
                placeholder="What changed in this version…"
                maxLength={1500}
              />
            </div>
            {versionChanged && changelogNotes.trim() && (
              <p className="mt-3 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-300">
                Saving will publish v{version.trim()} to the update history.
              </p>
            )}
          </section>
        )}

        {/* live preview of card identity */}
        <section className="panel rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold text-white">Preview</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <div className="aspect-[16/10] bg-elevated">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-950/40">
                  <CategoryIcon slug={category} className="h-8 w-8 text-violet-400/60" />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="truncate font-display text-sm font-semibold text-white">
                {name || "Product Name"}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                {shortDescription || "Short description appears here."}
              </p>
              <p className="mt-2 text-sm font-semibold text-violet-300">
                {(Number(price) || 0).toLocaleString("en-US")} R$
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
