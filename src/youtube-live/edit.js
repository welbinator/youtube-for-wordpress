import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { maxVideos } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('YouTube Live Settings', 'yt-for-wp')}>
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
            </div>
        </>
    );
}
