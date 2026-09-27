import { BlurView } from "expo-blur";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";





const LoadingSpinner = () => {


    const circle1 = useRef(
        new Animated.Value(0)
    ).current;

    const circle2 = useRef(
        new Animated.Value(0)
    ).current;

    const circle3 = useRef(
        new Animated.Value(0)
    ).current;




    useEffect(() => {

        const createBounce = (
            value: Animated.Value
        ) => {
            return Animated.sequence([
                Animated.timing(value, {
                    toValue: -10,
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),

                Animated.timing(value, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]);
        };


        const animation = Animated.loop(
            Animated.stagger(
                150,
                [
                    createBounce(circle1),
                    createBounce(circle2),
                    createBounce(circle3),
                ]
            )
        );

        animation.start();

        return () => {
            animation.stop();
        };

    }, []);

    return (
        <View
            className="spinner">
            <BlurView
                intensity={100}
                tint="dark"
                className="absolute inset-0"
            />

            <View className="spinner-content">
                <Animated.View
                    className="circle-accent"
                    style={{
                        transform: [
                            {
                                translateY: circle1
                            }
                        ]
                    }}
                />

                <Animated.View
                    className="circle-accent"
                    style={{
                        transform: [
                            {
                                translateY: circle2
                            }
                        ]
                    }}
                />

                <Animated.View
                    className="circle-accent"
                    style={{
                        transform: [
                            {
                                translateY: circle3
                            }
                        ]
                    }}
                />
            </View>
        </View>
    )

}




export default LoadingSpinner;