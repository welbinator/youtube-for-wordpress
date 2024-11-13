import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { layout, maxVideos, selectedPlaylist } = attributes;

    return (
        <div
            {...useBlockProps.save()}
            data-layout={layout}
            data-max-videos={maxVideos}
            data-selected-playlist={selectedPlaylist}
            id="youtube-feed-container"
        ></div>
    );
}
