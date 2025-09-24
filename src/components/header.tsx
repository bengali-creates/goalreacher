import React from 'react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button} from './ui/button'
import { LayoutDashboard,ChevronDown,GraduationCap,FileText,PenBox,StarsIcon } from 'lucide-react'
import { DropdownMenuTrigger,DropdownMenu,DropdownMenuItem,DropdownMenuContent} from './ui/dropdown-menu'

const Header = () => {
  return (
<header className='w-full flex justify-between items-center p-2 bg-background/50 backdrop-blur-md fixed top-0 z-50'>
    <nav className='w-full px-1 md:px-3 mx-auto flex justify-between items-center'>
        <Link href={"/"}>
        <Image src="/public/globe.svg" alt='main logo' width={100} height={50}
        className='h-12 py-1 w-auto object-contain'/>
        </Link>

        <div className='flex '>
            <SignedIn>
                <Link href={"/dashboard"}>
                <Button className=''>
                    <LayoutDashboard className='h-4 w-4' /> 
                    <span className='hidden md:block'>Insight</span>
                </Button>
                </Link>
                 <DropdownMenu >
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 ml-2">
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Build Resume
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/ai-cover-letter"
                    className="flex items-center gap-2"
                  >
                    <PenBox className="h-4 w-4" />
                    Cover Letter
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Interview Prep
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </SignedIn>
            
            <div id='clerk-auth-buttons' className=' ml-2'>
            <SignedOut>
                <SignInButton>
                     <Button> Sign In</Button>
                </SignInButton>
              
              <SignUpButton>
                <Button> Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
               appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: 37,
                    height: 37,
                  },
                  
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
                
              }}
              afterSignOutUrl="/"
               />
            </SignedIn>
        </div>
        </div>
        
    </nav>
</header>
  )
}

export default Header