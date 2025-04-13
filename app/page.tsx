"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw } from "lucide-react";

const PIPE_DEFAULT_RADIUS_MM = 11;
const POINTS_DISTANCE_MM = 200;

function calculateRadius(measured: number) {
  const s = measured;
  const L = POINTS_DISTANCE_MM;
  const radius = (4 * Math.pow(s, 2) + Math.pow(L, 2)) / (8 * s);
  return radius;
}

export default function CurveRadiusCalculator() {
  const [measured, setMeasured] = useState<number | null>(null);
  const [pipeRadius, setPipeRadius] = useState<number | null>(
    PIPE_DEFAULT_RADIUS_MM
  );
  const [debounced, setDebounced] = useState<{
    measured: number | null;
    pipeRadius: number | null;
  }>({
    measured: null,
    pipeRadius: PIPE_DEFAULT_RADIUS_MM,
  });

  // Reset second input to default value
  const handleReset = () => {
    setPipeRadius(PIPE_DEFAULT_RADIUS_MM);
  };

  // Debounce both input values
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({
        measured,
        pipeRadius,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [measured, pipeRadius]);

  // Calculate centimeters when debounced values change
  const [resultInner, resultOuter] = useMemo(() => {
    const { measured, pipeRadius } = debounced;

    if (measured === null || pipeRadius === null || measured === 0) {
      // If measured value is empty, we don't show anything
      // Same if it's 0, because then the curve radius would be infinite
      return [null, null] as const;
    }
    const radius = calculateRadius(measured);
    return [radius - pipeRadius, radius] as const;
  }, [debounced.measured, debounced.pipeRadius]);

  const tryParseFloat = (text: string): number | null => {
    if (!text) return null;
    const parsed = Number.parseFloat(text);
    if (Number.isNaN(parsed)) return null;
    return parsed;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Track curve radius</CardTitle>
          </div>
          <CardDescription>
            Enter measured values in millimeters to calculate the curve radius
            of the track.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstValue">Measured distance (mm)</Label>
              <Input
                id="firstValue"
                type="number"
                placeholder="Readout from measurement device"
                value={measured ?? ""}
                onChange={(e) => setMeasured(tryParseFloat(e.target.value))}
                step="any"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="secondValue">Pipe radius (mm)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset to Default
                </Button>
              </div>
              <Input
                id="secondValue"
                type="number"
                value={pipeRadius ?? ""}
                onChange={(e) => {
                  setPipeRadius(tryParseFloat(e.target.value));
                }}
                step="any"
                min="0"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Results will update automatically as you type
            </p>
          </div>

          {/* Fixed height result container */}
          <div className="h-32 flex flex-col justify-center items-center border rounded-lg p-4 bg-muted">
            <div className="text-sm text-muted-foreground mb-2">
              Track curve radius
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center border-r pr-4">
                <span className="text-sm text-muted-foreground mb-1">
                  At pipe center
                </span>
                <div className="text-center">
                  <span className="text-xl font-bold">
                    {
                      resultInner !== null
                        ? resultInner.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "--" /* Default when first input is empty */
                    }
                  </span>
                  <span className="text-base ml-1">mm</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground mb-1">
                  At point of measurement
                </span>
                <div className="text-center">
                  <span className="text-xl font-bold">
                    {
                      resultOuter !== null
                        ? resultOuter.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "--" /* Default when first input is empty */
                    }
                  </span>
                  <span className="text-base ml-1">mm</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
