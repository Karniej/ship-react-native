# Performance Optimization Guide

Best practices for optimizing performance in Ship React Native.

## Table of Contents

- [React Optimization](#react-optimization)
- [Image Optimization](#image-optimization)
- [List Optimization](#list-optimization)
- [Bundle Size](#bundle-size)
- [Network Optimization](#network-optimization)
- [Memory Management](#memory-management)
- [Profiling](#profiling)

---

## React Optimization

### When to Use React.memo

```typescript
// ✅ Good: Pure component with props that rarely change
const GenerationCard = React.memo(function GenerationCard({
  generation,
  onPress,
}: GenerationCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Image source={{ uri: generation.url }} />
      <Text>{generation.prompt}</Text>
    </Pressable>
  );
});

// ❌ Bad: Component with frequently changing props
const Timer = React.memo(function Timer({ time }: { time: number }) {
  return <Text>{time}</Text>; // Changes every second, memo is overhead
});
```

### When to Use useMemo

```typescript
// ✅ Good: Expensive computation
const sortedGenerations = useMemo(() => {
  return generations
    .filter((g) => g.type === selectedType)
    .sort((a, b) => b.createdAt - a.createdAt);
}, [generations, selectedType]);

// ❌ Bad: Simple operations
const fullName = useMemo(() => {
  return `${firstName} ${lastName}`; // Too simple, overhead not worth it
}, [firstName, lastName]);
```

### When to Use useCallback

```typescript
// ✅ Good: Passed to memoized children or in dependency arrays
const handlePress = useCallback((id: string) => {
  navigation.navigate('Detail', { id });
}, [navigation]);

// Used by memoized child
<GenerationList
  generations={generations}
  onItemPress={handlePress} // Stable reference prevents re-renders
/>

// ❌ Bad: Not passed to children or used in deps
const handleLocalAction = useCallback(() => {
  setCount(c => c + 1);
}, []); // Just use a regular function
```

### Optimize Context Usage

```typescript
// ❌ Bad: One big context
const AppContext = createContext({
  user: null,
  theme: "light",
  settings: {},
  generations: [],
}); // All consumers re-render on any change

// ✅ Good: Split contexts by update frequency
const UserContext = createContext(null);
const ThemeContext = createContext("light");
const SettingsContext = createContext({});
```

---

## Image Optimization

### Use expo-image (Recommended)

```bash
npx expo install expo-image
```

```typescript
import { Image } from 'expo-image';

// Better caching and performance than RN Image
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  transition={200}
  placeholder={blurhash}
  cachePolicy="memory-disk"
/>
```

### Image Caching Strategies

```typescript
// Prefetch images for gallery
import { Image } from "expo-image";

async function prefetchImages(urls: string[]) {
  await Promise.all(urls.map((url) => Image.prefetch(url)));
}

// Use in gallery screen
useEffect(() => {
  const upcomingUrls = generations.slice(0, 10).map((g) => g.url);
  prefetchImages(upcomingUrls);
}, [generations]);
```

### Optimize Image Sizes

```typescript
// Request appropriate sizes from AI APIs
const generateImage = async (prompt: string, isPremium: boolean) => {
  const size = isPremium ? "1792x1024" : "1024x1024";
  return await dalleGenerate({ prompt, size });
};

// Resize for thumbnails
const thumbnailUrl = `${imageUrl}?w=200&h=200&fit=cover`;
```

### Progressive Loading

```typescript
function ProgressiveImage({ uri, style }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={style}>
      {!loaded && <Skeleton style={StyleSheet.absoluteFill} />}
      <Image
        source={{ uri }}
        style={[style, { opacity: loaded ? 1 : 0 }]}
        onLoad={() => setLoaded(true)}
        transition={200}
      />
    </View>
  );
}
```

---

## List Optimization

### FlatList Best Practices

```typescript
function GenerationGallery({ generations }) {
  const renderItem = useCallback(({ item }) => (
    <GenerationCard generation={item} />
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      data={generations}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // Performance props
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
      // Avoid re-renders
      extraData={undefined}
    />
  );
}
```

### Virtualization for Large Lists

```typescript
// For very large lists, consider FlashList
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={generations}
  renderItem={renderItem}
  estimatedItemSize={200}
  drawDistance={200}
/>
```

### Optimize List Items

```typescript
// Avoid inline styles and functions
// ❌ Bad
<FlatList
  data={items}
  renderItem={({ item }) => (
    <View style={{ padding: 10 }}> {/* New object every render */}
      <Text onPress={() => handlePress(item.id)}> {/* New function */}
        {item.name}
      </Text>
    </View>
  )}
/>

// ✅ Good
const styles = StyleSheet.create({
  item: { padding: 10 }
});

const renderItem = useCallback(({ item }) => (
  <ListItem item={item} onPress={handlePress} />
), [handlePress]);

<FlatList data={items} renderItem={renderItem} />
```

---

## Bundle Size

### Analyze Bundle

```bash
# Generate bundle stats
npx expo export --dump-sourcemap

# Use source-map-explorer
npx source-map-explorer dist/bundles/*.js
```

### Tree Shaking

```typescript
// ❌ Bad: Import entire library
import * as _ from "lodash";
_.debounce(fn, 300);

// ✅ Good: Import only what you need
import debounce from "lodash/debounce";
debounce(fn, 300);
```

### Lazy Loading Screens

```typescript
// Screens are automatically lazy-loaded by Expo Router
// For heavy components, use React.lazy

const HeavyChart = React.lazy(() => import('./HeavyChart'));

function AnalyticsScreen() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### Remove Unused Dependencies

```bash
# Find unused dependencies
npx depcheck

# Remove unused
npm uninstall unused-package
```

---

## Network Optimization

### React Query Caching

```typescript
// Configure optimal caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

### Prefetching

```typescript
// Prefetch data user is likely to need
function HomeScreen() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch generations when home loads
    queryClient.prefetchQuery({
      queryKey: ["generations"],
      queryFn: fetchGenerations,
    });
  }, []);
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: deleteGeneration,
  onMutate: async (id) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ["generations"] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["generations"]);

    // Optimistically update
    queryClient.setQueryData(["generations"], (old) => old.filter((g) => g.id !== id));

    return { previous };
  },
  onError: (err, id, context) => {
    // Rollback on error
    queryClient.setQueryData(["generations"], context.previous);
  },
});
```

### Request Batching

```typescript
// Batch multiple requests
async function fetchMultiple(ids: string[]) {
  // Single request instead of N requests
  const response = await supabase.from("generations").select("*").in("id", ids);
  return response.data;
}
```

---

## Memory Management

### Clean Up Effects

```typescript
useEffect(() => {
  const subscription = someObservable.subscribe();

  return () => {
    subscription.unsubscribe(); // Clean up!
  };
}, []);
```

### Avoid Memory Leaks

```typescript
// ❌ Bad: Setting state after unmount
useEffect(() => {
  fetchData().then((data) => setData(data)); // May set after unmount
}, []);

// ✅ Good: Check if mounted
useEffect(() => {
  let mounted = true;

  fetchData().then((data) => {
    if (mounted) setData(data);
  });

  return () => {
    mounted = false;
  };
}, []);
```

### Clear Large Data

```typescript
// Clear large data when leaving screen
useFocusEffect(
  useCallback(() => {
    return () => {
      // Clear heavy data on blur
      setLargeImageData(null);
    };
  }, [])
);
```

### Image Memory

```typescript
// Unload off-screen images in lists
<FlatList
  removeClippedSubviews={true}
  // Images in clipped views are unloaded
/>
```

---

## Profiling

### React DevTools Profiler

1. Install React DevTools
2. Run app in development
3. Open Profiler tab
4. Record interaction
5. Analyze flame graph

### Performance Monitor

```typescript
// Enable performance monitor in dev
if (__DEV__) {
  // Shake device or Cmd+D
  // Select "Show Perf Monitor"
}
```

### Custom Performance Tracking

```typescript
// Track render times
function useRenderTime(componentName: string) {
  const renderStart = useRef(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStart.current;
    if (renderTime > 16) {
      // Longer than one frame
      console.warn(`${componentName} slow render: ${renderTime}ms`);
    }
  });
}
```

### Analytics Performance Events

```typescript
// Track performance in production
const startTime = performance.now();

await generateImage(prompt);

const duration = performance.now() - startTime;
analytics.track("generation_performance", {
  duration,
  model: "dall-e-3",
});
```

---

## Quick Wins Checklist

- [ ] Use `React.memo` for list items
- [ ] Add `keyExtractor` to all FlatLists
- [ ] Set `removeClippedSubviews={true}` on long lists
- [ ] Use `expo-image` instead of RN Image
- [ ] Configure React Query caching
- [ ] Clean up effects properly
- [ ] Avoid inline functions in render
- [ ] Use StyleSheet.create for styles
- [ ] Lazy load heavy screens
- [ ] Profile before and after optimizations
