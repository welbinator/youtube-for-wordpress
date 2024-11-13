import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { layout, maxVideos } = attributes;

    return (
        <div {...useBlockProps.save()} data-layout={layout} data-max-videos={maxVideos} id="youtube-feed-container"></div>
    );
}
