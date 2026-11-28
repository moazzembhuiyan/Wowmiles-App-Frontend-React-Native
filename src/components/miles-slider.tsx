import { useMemo, useState } from 'react';
import { PanResponder, Text, View } from 'react-native';

/** Draggable slider; the value snaps to `step`. Screen readers can adjust it with increment and decrement. */
export function MilesSlider({
  value,
  min,
  max,
  step = 100,
  minLabel,
  maxLabel,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  const [width, setWidth] = useState(0);

  const responder = useMemo(() => {
    const move = (x: number) => {
      if (width <= 0) return;
      const fraction = Math.min(1, Math.max(0, x / width));
      const raw = min + fraction * (max - min);
      onChange(Math.min(max, Math.max(min, Math.round(raw / step) * step)));
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => move(event.nativeEvent.locationX),
      onPanResponderMove: (event) => move(event.nativeEvent.locationX),
    });
  }, [width, min, max, step, onChange]);

  const clamp = (next: number) => onChange(Math.min(max, Math.max(min, next)));
  const ratio = max > min ? (value - min) / (max - min) : 1;

  return (
    <View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Miles to use"
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => clamp(value + (event.nativeEvent.actionName === 'increment' ? 1000 : -1000))}
        className="h-11 justify-center"
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        {...responder.panHandlers}
      >
        <View pointerEvents="none" className="h-[8px] rounded-full bg-[#E3E6EE]">
          <View className="h-full rounded-full bg-brand" style={{ width: `${ratio * 100}%` }} />
        </View>
        <View
          pointerEvents="none"
          className="absolute h-8 w-8 rounded-full border-[3px] border-brand bg-white"
          style={{ left: Math.max(0, Math.min(width - 32, ratio * width - 16)), elevation: 3 }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-[13px] text-muted">{minLabel}</Text>
        <Text className="text-[13px] text-muted">{maxLabel}</Text>
      </View>
    </View>
  );
}
