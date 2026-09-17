"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/src/components/lang-context";
import { geocodeStructureAddress, updateStructureLocation } from "@/src/app/actions/structure";

type Props = {
  propertyId: string;
  unitCount: number;
  unitNumbers: string[];
  initial: { address: string; latitude: number; longitude: number };
};

export default function StructureLocationCard({ propertyId, unitCount, unitNumbers, initial }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const [address, setAddress] = useState(initial.address);
  const [lat, setLat] = useState<string>(String(initial.latitude ?? 0));
  const [lng, setLng] = useState<string>(String(initial.longitude ?? 0));
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  const findOnMap = () => {
    setError(null);
    setSaved(false);
    setGeocoding(true);
    void geocodeStructureAddress(address).then((res) => {
      setGeocoding(false);
      if (res.success) {
        setLat(String(res.latitude));
        setLng(String(res.longitude));
      } else {
        setError(res.error || "Errore.");
      }
    });
  };

  const save = () => {
    setError(null);
    setSaved(false);
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    startTransition(() => {
      void updateStructureLocation(propertyId, { address, latitude, longitude }).then((res) => {
        if (res.success) {
          setSaved(true);
          router.refresh();
        } else {
          setError(res.error || "Errore durante il salvataggio.");
        }
      });
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-violet-500">📍</span>
        <span className="text-sm font-semibold text-slate-900">{t.stLocation}</span>
        <span className="ml-auto text-[12px] text-gray-400">{t.stLocationForAll}</span>
      </div>

      <div>
        <label className={labelCls}>{t.stAddressLabel}</label>
        <input className={inputCls} value={address} onChange={(e) => { setAddress(e.target.value); setSaved(false); }} />
      </div>

      <button
        type="button"
        onClick={findOnMap}
        disabled={geocoding || isPending}
        className="w-full rounded-xl border border-violet-200 bg-violet-50 py-2 text-sm font-semibold text-violet-600 disabled:opacity-40"
      >
        {geocoding ? t.stGeocoding : `📌 ${t.stFindOnMap}`}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.afLatitude}</label>
          <input type="number" step="any" className={inputCls} value={lat} onChange={(e) => { setLat(e.target.value); setSaved(false); }} />
        </div>
        <div>
          <label className={labelCls}>{t.afLongitude}</label>
          <input type="number" step="any" className={inputCls} value={lng} onChange={(e) => { setLng(e.target.value); setSaved(false); }} />
        </div>
      </div>
      <p className="text-[12px] leading-relaxed text-gray-400">{t.stCoordsHint}</p>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">{t.stLocationSaved}</p>}

      <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
        <span className="flex items-center gap-1.5 text-[12px] text-amber-600">
          <span>⚠️</span>{t.stUpdateUnitsWarn(unitCount, unitNumbers.join(", "))}
        </span>
        <button
          type="button"
          onClick={save}
          disabled={isPending || geocoding}
          className="ml-auto rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {isPending ? t.stLocationSaving : t.stSaveLocation}
        </button>
      </div>
    </div>
  );
}
