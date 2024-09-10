export function isInIframe() {
    return window.self !== window.top;
}

export function isInCanvas() {
    const urlParams = new URLSearchParams(window.location.search);
    return isInIframe() || urlParams.get('canvas') === 'true';
}
