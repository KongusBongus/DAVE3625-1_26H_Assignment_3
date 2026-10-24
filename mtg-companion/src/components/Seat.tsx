import { ReactNode, useState } from "react";
import { View } from "react-native";

interface SeatProps {
    rotation: number; // 0, 180, 90 or -90
    children: ReactNode;
}

export default function Seat({ rotation, children }: SeatProps) {
    const [size, setSize] = useState({ w: 0, h: 0 });
    const swap = rotation === 90 || rotation === -90;
    const iw = swap ? size.h : size.w;
    const ih = swap ? size.w : size.h;

    return (
    <View
        style={{ flex: 1, overflow: "hidden" }}
        onLayout={(e) =>
        setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
        }
    >
        {size.w > 0 && (
        <View
            style={{
            position: "absolute",
            width: iw,
            height: ih,
            left: (size.w - iw) / 2,
            top: (size.h - ih) / 2,
            transform: [{ rotate: `${rotation}deg` }],
            }}
        >
            {children}
        </View>
        )}
    </View>
    );
}