import { Image, Text, View } from 'react-native';

const Badge = ({text, icon} : BadgeProps) => {
    return (
        <View className="badge">
            <Image source={icon} className="badge-icon" />
            <Text className="badge-text">{text}</Text>
        </View>
    )
}

export default Badge;