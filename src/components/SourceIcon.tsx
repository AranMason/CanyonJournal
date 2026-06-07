import PersonIcon from '@mui/icons-material/Person';
import UnknownCanyonSource from '@mui/icons-material/Person';

const SourceIcon: React.FC<{ sourceLogoUrl?: string | null, isUserCanyon?: boolean, size?: number }> = ({ sourceLogoUrl, isUserCanyon, size = 16 }) => {

    if(sourceLogoUrl) {
        return <img src={sourceLogoUrl} alt="" style={{ height: size, width: size, objectFit: 'contain' }} onError={() => null}/>
    }

    if(isUserCanyon) {
        return <PersonIcon sx={{ fontSize: size, color: 'text.secondary' }} />
    }

    return <UnknownCanyonSource sx={{ fontSize: size, color: "text.secondary" }} />
}

export default SourceIcon;