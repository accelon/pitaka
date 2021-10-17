export const detectOrientation=()=>{
    let orientation='vertical';
    const mm=q=>window.matchMedia(q).matches;
    if (mm('(min-width: 769px)') || mm('(orientation:landscape)')) orientation='horizontal';
    return orientation;
}
