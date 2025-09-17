# Layout Changes Plan: Chat and OnlinePlayersList Width Distribution

## Current Situation
The Chat component and OnlinePlayersList component are currently laid out in `GameFooter.tsx` with the following width distribution:
- Chat component (EnhancedChat): Takes up remaining space with `flex-1`
- OnlinePlayersList component: Has a fixed width of `w-80` (320px)

## Required Changes
The user wants to change the width distribution to:
- Chat component: 90% of the available width
- OnlinePlayersList component: 10% of the available width

## Implementation Details

### File to Modify: `src/components/GameFooter.tsx`

#### Current Code (lines 118-130):
```jsx
<div className="h-full px-2">
  <div className="flex h-full gap-2">
    {/* Чат на всю ширину с небольшим отступом слева */}
    <div className="flex-1">
      <EnhancedChat userId={player.id} username={player.username} />
    </div>
    
    {/* Список игроков справа с небольшим отступом справа */}
    <div className="w-80 flex-shrink-0">
      <ResizableOnlinePlayersList />
    </div>
  </div>
</div>
```

#### Required Changes:
1. Change the Chat container from `flex-1` to `w-[90%]`
2. Change the OnlinePlayersList container from `w-80 flex-shrink-0` to `w-[10%] flex-shrink-0`

#### Modified Code:
```jsx
<div className="h-full px-2">
  <div className="flex h-full gap-2">
    {/* Чат занимает 90% ширины */}
    <div className="w-[90%]">
      <EnhancedChat userId={player.id} username={player.username} />
    </div>
    
    {/* Список игроков занимает 10% ширины */}
    <div className="w-[10%] flex-shrink-0">
      <ResizableOnlinePlayersList />
    </div>
  </div>
</div>
```

## Additional Considerations

### Responsive Design
The current implementation uses fixed widths which might not be ideal for all screen sizes. Consider adding responsive breakpoints if needed.

### Component Compatibility
- The EnhancedChat component should adapt well to the new width constraints
- The OnlinePlayersList component may need adjustments to display properly in the narrower 10% width
  - Consider reducing font sizes further if needed
  - Ensure player names and levels are still readable

### Testing Checklist
- [ ] Verify the layout displays correctly with the new width distribution
- [ ] Test on different screen sizes to ensure responsiveness
- [ ] Check that all chat functionality remains intact
- [ ] Verify that the OnlinePlayersList is still usable in the narrower width
- [ ] Ensure the resize functionality for the chat height still works correctly

## Implementation Steps
1. Modify the width classes in GameFooter.tsx as described above
2. Test the changes in the application
3. Make any necessary adjustments to the OnlinePlayersList component for better readability in the narrower space
4. Verify all functionality works as expected