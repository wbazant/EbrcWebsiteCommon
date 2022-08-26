import React from 'react';
import { RadioList, SingleSelect, TextBox } from '@veupathdb/wdk-client/lib/Components';
import * as ComponentUtils from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import * as ReporterUtils from '@veupathdb/wdk-client/lib/Views/ReporterForm/reporterUtils';
import SrtHelp from '../SrtHelp';

let util = Object.assign({}, ComponentUtils, ReporterUtils);

let defLineOptions = [
  {  value: '1', display: 'Only Gene ID' },
  {  value: '0', display: 'Full Fasta Header' }
];

let genomicFeatureOptions = [
  {  value: 'low_complexity_regions', display: 'Low complexity regions' }
];

let proteinFeatureOptions = [
  { value: 'interpro', display: 'InterPro' },
  { value: 'signalp', display: 'SignalP' },
  { value: 'tmhmm', display: 'Transmembrane domains' },
];

let genomicAnchorValues = [
  { value: 'Start', display: 'Transcription Start***' },
  { value: 'CodeStart', display: 'Translation Start (ATG)' },
  { value: 'CodeEnd', display: 'Translation Stop Codon' },
  { value: 'End', display: 'Transcription Stop***' }
];

let proteinAnchorValues = [
  { value: 'Start', display: 'Downstream from Start' },
  { value: 'End', display: 'Upstream from End' }
];

let signs = [
  { value: 'plus', display: '+' },
  { value: 'minus', display: '-' }
];

let SequenceRegionRange = props => {
  let { label, anchor, sign, offset, formState, getUpdateHandler } = props;
  return (
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect name={anchor} value={formState[anchor]}
          onChange={getUpdateHandler(anchor)} items={genomicAnchorValues}/>
      <SingleSelect name={sign} value={formState[sign]}
          onChange={getUpdateHandler(sign)} items={signs}/>
      <TextBox name={offset} value={formState[offset]}
          onChange={getUpdateHandler(offset)} size="6"/>
      nucleotides
    </React.Fragment>
  );
};

let ProteinRegionRange = props => {
  let { label, anchor, offset, formState, getUpdateHandler } = props;
  return (
    <React.Fragment>
      <span>{label}</span>
      <SingleSelect name={anchor} value={formState[anchor]}
          onChange={getUpdateHandler(anchor)} items={proteinAnchorValues}/>
      <TextBox name={offset} value={formState[offset]}
          onChange={getUpdateHandler(offset)} size="6"/>
      aminoacids
    </React.Fragment>
  );
};

let GenomicSequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  return (
    <div>
      <div style={{margin:'0.5em'}}>Choose the region of the sequence(s):</div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(5, auto)',
          alignItems: 'center',
          gridGap: '0.5em',
          marginLeft: '2em'
        }}
      >
        <SequenceRegionRange label="Begin at" anchor="upstreamAnchor" sign="upstreamSign"
          offset="upstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
        <SequenceRegionRange label="End at" anchor="downstreamAnchor" sign="downstreamSign"
          offset="downstreamOffset" formState={formState} getUpdateHandler={getUpdateHandler}/>
      </div>
    </div>
  );
}
let ProteinSequenceRegionInputs = props => {
  let { formState, getUpdateHandler } = props;
  return (
    <div>
      <div style={{margin:'0.5em'}}>Choose the region of the protein sequence(s):</div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: 'repeat(4, auto)',
          alignItems: 'center',
          gridGap: '0.5em',
          marginLeft: '2em'
        }}
      >
        <ProteinRegionRange label="Begin at" anchor="startAnchor3" offset="startOffset3"
          formState={formState} getUpdateHandler={getUpdateHandler}/>
        <ProteinRegionRange label="End at" anchor="endAnchor3" offset="endOffset3"
          formState={formState} getUpdateHandler={getUpdateHandler}/>
      </div>
    </div>
  );
};

let FeaturesList = props => {
  let { features, field, formState, getUpdateHandler} = props;
  return (
    <div>
      <div style={{margin:'0.5em'}}>Choose feature type:</div>
      <div
        style={{
          marginLeft: '2em'
        }}>
        <RadioList name={field} value={formState[field]} onChange={getUpdateHandler(field)} items={features}/>
      </div>
    </div>
  );
}

/** @type import('./Types').ReporterFormComponent */
let FastaGeneReporterForm = props => {
  let { formState, updateFormState, onSubmit, includeSubmit } = props;
  let getUpdateHandler = fieldName => util.getChangeHandler(fieldName, updateFormState, formState);
  let typeUpdateHandler = function(newTypeValue) {
    updateFormState(Object.assign({}, formState, { type: newTypeValue }));
  };
  return (
    <div>
      <h3>Choose the type of result:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="type" value={formState.type}
          onChange={typeUpdateHandler} items={
          [
            { value: 'genomic', display: 'Genomic sequence', body:  (<GenomicSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>)},
            { value: 'genomic_features', display: 'Genomic features', body: (<FeaturesList field="genomicFeature" features={genomicFeatureOptions} formState={formState} getUpdateHandler={getUpdateHandler} />) },
            { value: 'protein', display: 'Protein sequence', body: (<ProteinSequenceRegionInputs formState={formState} getUpdateHandler={getUpdateHandler}/>)},
            { value: 'protein_features', display: 'Protein features', body: (<FeaturesList field="proteinFeature" features={proteinFeatureOptions} formState={formState} getUpdateHandler={getUpdateHandler} />) },
            { value: 'cds', display: 'CDS sequence'},
            { value: 'transcript', display: 'Transcript sequence'},
          ]  
          
          }/>
      </div>
      <h3>Download Type:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="attachmentType" value={formState.attachmentType}
          onChange={getUpdateHandler('attachmentType')} items={util.attachmentTypes}/>
      </div>
      <h3>Fasta defline:</h3>
      <div style={{marginLeft:"2em"}}>
        <RadioList name="onlyIdDefLine" value={formState.onlyIdDefLine}
          onChange={getUpdateHandler('onlyIdDefLine')} items={defLineOptions}/>
      </div>
      { includeSubmit &&
        <div style={{margin:'0.8em'}}>
          <button className="btn" type="submit" onClick={onSubmit}>Get Sequences</button>
        </div>
      }

      <div>
        <hr/>
        <b>Note:</b><br/>
        For "genomic" sequence: If UTRs have not been annotated for a gene, then choosing
        "transcription start" may have the same effect as choosing "translation start".<br/>
        For "protein" sequence: you can only retrieve sequence contained within the ID(s)
        listed. i.e. from downstream of amino acid sequence start (ie. Methionine = 0) to
        upstream of the amino acid end (last amino acid in the protein = 0).<br/>
        <hr/>
      </div>
      <SrtHelp/>
    </div>
  );
};

FastaGeneReporterForm.getInitialState = () => ({
  formState: {
    attachmentType: 'plain',
    type: 'genomic',

    // sequence region inputs for 'genomic'
    upstreamAnchor: 'Start',
    upstreamSign: 'plus',
    upstreamOffset: 0,
    downstreamAnchor: 'End',
    downstreamSign: 'plus',
    downstreamOffset: 0,
    onlyIdDefLine: '0',
    noLineBreaks: '0',


    // sequence region inputs for 'protein'
    startAnchor3: 'Start',
    startOffset3: 0,
    endAnchor3: 'End',
    endOffset3: 0,

    genomicFeature: genomicFeatureOptions[0].value,
    proteinFeature: proteinFeatureOptions[0].value,
  },
  formUiState: {}
});

export default FastaGeneReporterForm;
