import CandidateProfileClient from './CandidateProfileClient'

const CandidateProfilePage = async ({
    params,
}: {
    params: Promise<{ candidateId: string }>
}) => {
    const { candidateId } = await params
    return <CandidateProfileClient candidateId={candidateId} />
}

export default CandidateProfilePage
