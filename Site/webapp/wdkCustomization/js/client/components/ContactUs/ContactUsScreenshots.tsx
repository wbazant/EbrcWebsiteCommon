import React, { useCallback, useEffect, useState } from 'react';

import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';

import { ImageUploadDialog } from './ImageUploadDialog';

import './ContactUsScreenshots.scss';

const cx = makeClassNameHelper('ContactUsScreenshots');

interface Props {
  addScreenshot: (file: File) => void;
  removeScreenshot: (index: number) => void;
  screenshotMetadata: { id: number, file: File }[];
}

const ContactUsScreenshots = ({
  addScreenshot,
  removeScreenshot,
  screenshotMetadata
}: Props) => {
  const [ imageUploadDialogOpen, setImageUploadDialogOpen ] = useState(false);

  const onImageUploadDialogOpen = useCallback(() => {
    setImageUploadDialogOpen(true);
  }, []);

  const onImageUploadDialogSubmit = useCallback((file: File) => {
    setImageUploadDialogOpen(false);
    addScreenshot(file);
  }, [ addScreenshot ]);

  const onImageUploadDialogClose = useCallback(() => {
    setImageUploadDialogOpen(false);
  }, []);

  return (
    <div className={cx()}>
      {
        imageUploadDialogOpen &&
        <ImageUploadDialog
          onSubmit={onImageUploadDialogSubmit}
          onClose={onImageUploadDialogClose}
        />
      }
      Attach up to three screenshots from your clipboard (maximum 5Mb per image).
      <div className={cx('--ScreenshotPreviews')}>
        {
          screenshotMetadata.map(
            (screenshotMetadatum, i) => (
              <ScreenshotPreview
                key={screenshotMetadatum.id}
                onRemoveScreenshot={() => {
                  removeScreenshot(i);
                }}
                imageFile={screenshotMetadatum.file}
              />
            )
          )
        }
      </div>
      {
        screenshotMetadata.length < 3 &&
        <button className={cx('--AddScreenshot')} type="button" onClick={onImageUploadDialogOpen}>{
          screenshotMetadata.length === 0
            ? 'Add a screenshot'
            : 'Add another screenshot'
        }</button>
      }
    </div>
  );
}

interface ScreenshotProps {
  imageFile: File;
  onRemoveScreenshot: () => void;
}

function ScreenshotPreview({ imageFile, onRemoveScreenshot }: ScreenshotProps) {
  const [ imageUrl, setImageUrl ] = useState<string | undefined>(undefined);

  useEffect(() => {
    setImageUrl(URL.createObjectURL(imageFile));
  }, [ imageFile ]);

  useEffect(() => () => {
    if (imageUrl != null) {
      URL.revokeObjectURL(imageUrl);
    }
  }, [ imageUrl ] );

  return (
    <div className={cx('--ScreenshotPreview')}>
      <img src={imageUrl} />
      <button type="button" onClick={onRemoveScreenshot}>Remove this screenshot</button>
    </div>
  );
}

export default ContactUsScreenshots;
