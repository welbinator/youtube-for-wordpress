import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const { layout = 'grid' } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Layout Settings', 'simple-youtube-feed')}>
                    <SelectControl
                        label={__('Select Layout', 'simple-youtube-feed')}
                        value={layout}
                        options={[
                            { label: __('Grid View', 'simple-youtube-feed'), value: 'grid' },
                            { label: __('List View', 'simple-youtube-feed'), value: 'list' },
                        ]}
                        onChange={(newLayout) => setAttributes({ layout: newLayout })}
                    />
                </PanelBody>
            </InspectorControls>

            <p {...useBlockProps()}>
                {__('Simple YouTube Feed – hello from the editor!', 'simple-youtube-feed')}
            </p>
        </>
    );
}
