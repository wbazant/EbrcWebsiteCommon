import { 
  compose,
  concat,
  filter, 
  isEqual, 
  length,
  map, 
  split, 
  trim 
} from 'lodash/fp';
import { createSelector } from 'reselect';

import { 
  SUBMISSION_FAILED, 
  SUBMISSION_SUCCESSFUL 
} from '../store-modules/ContactUsStoreModule';

// Source: emailregex.com (which implements the RFC 5322 standard)
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const MAX_ATTACHMENT_SIZE = 5000000;

const propSelectorFactory = prop => state => state[prop];

export const submittingStatus = propSelectorFactory('submittingStatus');
export const submissionStatus = propSelectorFactory('submissionStatus');
export const responseMessage = propSelectorFactory('responseMessage');
export const subjectValue = propSelectorFactory('subject');
export const reporterEmailValue = propSelectorFactory('reporterEmail');
export const ccEmailsValue = propSelectorFactory('ccEmails');
export const messageValue = propSelectorFactory('message');
export const contextValue = propSelectorFactory('context');
export const attachmentMetadata = propSelectorFactory('attachmentMetadata');
export const screenshotMetadata = propSelectorFactory('screenshotMetadata');

export const submitDisabled = submittingStatus;

export const submissionFailed = createSelector(
  submissionStatus,
  isEqual(SUBMISSION_FAILED)
);

export const submissionSuccessful = createSelector(
  submissionStatus,
  isEqual(SUBMISSION_SUCCESSFUL)
);

export const reporterEmailValidity = createSelector(
  reporterEmailValue,
  reporterEmail => reporterEmail.length > 0 && !EMAIL_REGEX.test(reporterEmail)
    ? 'Please provide a valid email address where we can reach you.' 
    : ''
);

export const messageValidity = createSelector(
  messageValue,
  message => message.length === 0
    ? 'Please provide a message for our team.' 
    : ''
);

export const parsedCcEmails = createSelector(
  ccEmailsValue,
  compose(
    filter(length),
    map(trim),
    split(/[;,]/)
  )
);

export const ccEmailsValidity = createSelector(
  parsedCcEmails,
  ccEmails => {
    if (ccEmails.length > 10) {
      return 'Please provide at most 10 emails to cc.';
    } 
    
    const invalidEmails = ccEmails.filter(ccEmail => !EMAIL_REGEX.test(ccEmail));
    
    return invalidEmails.length 
      ? `Please correct the following email address(es): ${invalidEmails.join(', ')}.`
      : '';
  }
);

export const files = createSelector(
  attachmentMetadata,
  screenshotMetadata,
  compose(
    map('file'),
    concat
  )
);

export const validatedAttachmentMetadata = createSelector(
  attachmentMetadata,
  attachmentMetadata => map(validateMetadatum)(attachmentMetadata)
);

const validateMetadatum = metadatum => {
  if (!metadatum.file) {
    return addValidityToAttachmentMetadatum(metadatum, 'Please choose a file to upload.')
  } else if (metadatum.file.size > MAX_ATTACHMENT_SIZE) {
    return addValidityToAttachmentMetadatum(metadatum, 'Please choose a file which is under 5 Mb.');
  } else {
    return addValidityToAttachmentMetadatum(metadatum, '');
  }    
};

const addValidityToAttachmentMetadatum = (metadatum, validity) => ({
  ...metadatum,
  validity
});

export const parsedFormFields = createSelector(
  subjectValue,
  reporterEmailValue,
  parsedCcEmails,
  messageValue,
  contextValue,
  (subject, reporterEmail, ccEmails, message, context) => ({
    subject,
    reporterEmail,
    ccEmails,
    message,
    context
  })
);
