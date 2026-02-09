import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { API } from "@/App";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeoFilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const state_cd = searchParams.get("state_cd") || "";
  const c_district = searchParams.get("c_district") || "";
  const city = searchParams.get("city") || "";

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);

  const geoParams = useMemo(() => ({ state_cd, c_district, city }), [state_cd, c_district, city]);

  // Radix Select disallows empty-string item values, so we use a sentinel for "All".
  const ALL = "__ALL__";
  const stateValue = state_cd || ALL;
  const districtValue = c_district || ALL;
  const cityValue = city || ALL;

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    // reset dependents
    if (key === "state_cd") {
      next.delete("c_district");
      next.delete("city");
    }
    if (key === "c_district") {
      next.delete("city");
    }
    setSearchParams(next, { replace: true });
  };

  const clearAll = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("state_cd");
    next.delete("c_district");
    next.delete("city");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API}/dashboard/geo/states`)
      .then((res) => {
        if (!cancelled) setStates(res.data.states || []);
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setDistricts([]);
    setCities([]);
    if (!state_cd) return () => {};
    axios
      .get(`${API}/dashboard/geo/districts`, { params: { state_cd } })
      .then((res) => {
        if (!cancelled) setDistricts(res.data.districts || []);
      })
      .catch(() => {
        if (!cancelled) setDistricts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [state_cd]);

  useEffect(() => {
    let cancelled = false;
    setCities([]);
    if (!state_cd || !c_district) return () => {};
    axios
      .get(`${API}/dashboard/geo/cities`, { params: { state_cd, c_district } })
      .then((res) => {
        if (!cancelled) setCities(res.data.cities || []);
      })
      .catch(() => {
        if (!cancelled) setCities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [state_cd, c_district]);

  const hasAny = Boolean(state_cd || c_district || city);

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-white/30">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">State</div>
              <Select
                value={stateValue}
                onValueChange={(v) => setParam("state_cd", v === ALL ? "" : v)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">District</div>
              <Select
                value={districtValue}
                onValueChange={(v) => setParam("c_district", v === ALL ? "" : v)}
                disabled={!state_cd}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={state_cd ? "All Districts" : "Select State first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">City / Locality</div>
              <Select
                value={cityValue}
                onValueChange={(v) => setParam("city", v === ALL ? "" : v)}
                disabled={!c_district}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={c_district ? "All Cities" : "Select District first"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-white"
              onClick={clearAll}
              disabled={!hasAny}
              data-testid="geo-clear-filters"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Expose current selection for debugging/testing */}
        <div className="mt-2 text-[11px] text-gray-500">
          Active filters:{" "}
          {Object.entries(geoParams)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ") || "None"}
        </div>
      </CardContent>
    </Card>
  );
}


