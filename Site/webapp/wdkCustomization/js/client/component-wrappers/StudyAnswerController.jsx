import { get } from 'lodash';
import React, { useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import DownloadLink from 'ebrc-client/App/Studies/DownloadLink';
import CategoryIcon from 'ebrc-client/App/Categories/CategoryIcon';
import StudySearchIconLinks from 'ebrc-client/App/Studies/StudySearches';

// wrapping WDKClient AnswerController for specific rendering on certain columns
function StudyAnswerController(props) {
  const studyEntities = useSelector(state => state.studies && state.studies.entities);

  const { visibleRecords, totalCount } = useMemo(
    () => {
      const enabledStudyIds = (
        studyEntities && 
        studyEntities.filter(({ disabled }) => !disabled).map(({ id }) => id)
      );

      const enabledStudyIdsSet = new Set(enabledStudyIds);

      return {
        visibleRecords: (
          props.stateProps.records && 
          props.stateProps.records.filter(record => enabledStudyIdsSet.has(record.id[0].value))
        ),
        totalCount: (
          props.stateProps.unfilteredRecords && 
          props.stateProps.unfilteredRecords.reduce(
            (count, record) => count + (enabledStudyIdsSet.has(record.id[0].value) ? 1 : 0),
            0
          )
        )
      };
    }, 
    [ studyEntities, props.stateProps.records, props.stateProps.unfilteredRecords ]
  );

  console.log(props);
  console.log(visibleRecords);

  return (
    <React.Fragment>
      <props.DefaultComponent 
        {...props}
        stateProps={{
          ...props.stateProps,
          records: visibleRecords,
          meta: props.stateProps.meta && {
            ...props.stateProps.meta,
            totalCount
          }
        }}
        renderCellContent={renderCellContent}
      />
      
    </React.Fragment>
  );
}

// StudySearchCellContent wraps StudySearchIconLinks
// - accessing the store to get new props needed to render StudySearchIconLinks (aka StudySearches) 
// --- using connect(mapStateToProps,..): pattern also used in StudyRecordHeading
let StudySearchCellContent = connect(mapStateToProps, null)(StudySearchIconLinks);

/* prop types defined in WDKClient/../AnswerController.jsx
   and used in Answer.jsx
 
interface CellContentProps {
  value: AttributeValue;
  attribute: AttributeField;
  record: RecordInstance;
  recordClass: RecordClass;
}
interface RenderCellProps extends CellContentProps {
  CellContent: React.ComponentType<CellContentProps>;
}
interface RowClassNameProps {
  record: RecordInstance;
  recordClass: RecordClass;
}
*/

// currying to use projectId
const deriveRowClassName = projectId => props => {
  const { project_availability } = props.record.attributes;
  if (project_availability == null || project_availability.includes('"' + projectId + '"')) {
    return 'non-greyed-out';}
  return 'greyed-out';
};

const renderCellContent = props => {
  if (props.attribute.name === 'study_categories') {
    let studyCategories = JSON.parse(props.record.attributes.study_categories);
    return studyCategories && studyCategories.map(cat => (
              <CategoryIcon category={cat} key={cat} />
            ));
  }
  if (props.attribute.name === 'card_questions') { 
     return <StudySearchCellContent {...props}/> 
  }
  if (props.attribute.name === 'bulk_download_url') {
    return <DownloadLink studyId={props.record.id[0].value} studyUrl= {props.record.attributes.bulk_download_url.url}/>;
  }
  return <props.CellContent {...props}/>
};


// mapStateToProps()
// - input props: StudySearchCellContent, of type RenderCellProps  
//   will be converted into new props needed to render StudySearchIconLinks (defined in StudySearches.jsx)
// --- entries = [{question, recordClass}],
// --- webAppUrl
//
function mapStateToProps(state,props) {
  const { record } = props;
  const { globalData, studies } = state;
  const { siteConfig } = globalData;
  const { webAppUrl } = siteConfig;

  if (studies.loading) {
    return { loading: true };
  }

  const studyId = record.id
    .filter(part => part.name === 'dataset_id')
    .map(part => part.value)[0];

  const study = get(studies, 'entities', [])
    .find(study => study.id === studyId);

  return { study, webAppUrl };
}



function mapStateToProps2(state) {
  const { projectId } = state.globalData.siteConfig;
  return { projectId };
}


export default connect(mapStateToProps2, null)(StudyAnswerController);
