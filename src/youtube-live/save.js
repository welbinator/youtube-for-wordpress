import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { maxVideos } = attributes;

    return (
        <div
            {...useBlockProps.save()}
            data-max-videos={maxVideos}
            id="youtube-live-container"
        ></div>
    );
}
