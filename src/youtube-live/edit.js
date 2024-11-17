import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, RangeControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { channelId, maxVideos } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('YouTube Live Settings', 'yt-for-wp')}>
                    <TextControl
                        label={__('YouTube Channel ID', 'yt-for-wp')}
                        value={channelId || YT_FOR_WP.channelId} // Default to settings if blank
                        onChange={(newChannelId) => setAttributes({ channelId: newChannelId })}
                        help={__('Leave this blank to use the default Channel ID from the plugin settings.', 'yt-for-wp')}
                    />
                    <RangeControl
                        label={__('Number of Videos to Show', 'yt-for-wp')}
                        value={maxVideos}
                        onChange={(newMaxVideos) => setAttributes({ maxVideos: newMaxVideos })}
                        min={1}
                        max={5}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                <p>{__('YouTube Live Feed', 'yt-for-wp')}</p>
                <p>
                    {__('Channel ID:', 'yt-for-wp')} {channelId || YT_FOR_WP.channelId}
                </p>
            </div>
        </>
    );
}
