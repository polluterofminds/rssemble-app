const Frame = ({ url, className }: { url: string, className: string }) => {
  return (
    <iframe 
        src={url}
        className={`h-[75vh] w-full${className}`}
    />
  )
}

export default Frame