import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { channelId, maxVideos } = attributes;

    return (
        <div
            {...useBlockProps.save()}
            data-channel-id={channelId || YT_FOR_WP.channelId} // Default to settings if blank
            data-max-videos={maxVideos}
            id="youtube-live-container"
        ></div>
    );
}
