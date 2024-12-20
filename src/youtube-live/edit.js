import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { maxVideos } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('YouTube Live Settings', 'toolkit-integration-for-youtube')}>
                    <RangeControl
                        label={__('Number of Videos to Show', 'toolkit-integration-for-youtube')}
                        value={maxVideos}
                        onChange={(newMaxVideos) => setAttributes({ maxVideos: newMaxVideos })}
                        min={1}
                        max={5}
                    />
                </PanelBody>
            </InspectorControls>
            <div {...useBlockProps()}>
                <p>{__('YouTube Live Feed', 'toolkit-integration-for-youtube')}</p>
            </div>
        </>
    );
}
