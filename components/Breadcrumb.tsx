import { useRouter } from 'expo-router';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  textColor: string;
  separatorColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function Breadcrumb({ items, textColor, separatorColor, containerStyle }: BreadcrumbProps) {
  const router = useRouter();
  const separator = separatorColor ?? textColor;

  return (
    <View style={[styles.container, containerStyle]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View key={`${item.label}-${index}`} style={styles.itemRow}>
            {item.href && !isLast ? (
              <TouchableOpacity onPress={() => router.push(item.href as never)}>
                <Text style={[styles.linkText, { color: textColor }]}>{item.label}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.currentText, { color: textColor }]}>{item.label}</Text>
            )}

            {!isLast && <Text style={[styles.separator, { color: separator }]}>/</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    opacity: 0.85,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 12,
    opacity: 0.8,
  },
});
