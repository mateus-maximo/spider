function maybeAsync(callback: () => void) {
    if (Math.random() < 0.5) {
        process.nextTick(callback);
    } else {
        process.nextTick(callback);
    }
}

console.log('Before')
maybeAsync(() => {
    console.log('Callback!');
});
console.log('After')
